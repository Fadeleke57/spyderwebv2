import os
import io
import uuid
import json
import boto3
from pytz import UTC
from datetime import datetime
from typing import Optional, Literal
from pymongo import ReturnDocument
from fastapi import APIRouter, Depends, UploadFile, File, Query, BackgroundTasks
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from fastapi.exceptions import HTTPException
from botocore.exceptions import ClientError
from werkzeug.utils import secure_filename
from src.routes.auth.utils import manager
from src.lib.s3.index import S3Bucket
from src.db.neo4j import client as neo4j_client
from src.models.index import (
    Webs,
    Web,
    CreateWeb,
    UpdateWeb,
    IterateWeb,
    User,
    PublicUser,
    Users,
    Search,
    Searches,
    create_web,
)
from src.lib.logger.index import logger
from src.core.config import settings
from src.lib.stytch.index import client as stytch_client
from src.lib.pinecone.index import client as pinecone_client
from src.service.web import service as web_service
from src.service.source import service as source_service
from src.routes.chat.index import configure_chat
from src.utils.storage import track_file_storage
from src.utils.utility import clean_unicode

router = APIRouter()

s3_bucket = S3Bucket(bucket_name=settings.s3_bucket_name)
s3_session_client = boto3.client("s3")


@router.get("/all/user")
def get_user_webs(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    criteria: Optional[str] = None,
    user: User = Depends(manager.required),
):
    """
    Retrieve paginated webs belonging to a user, sorted by creation date in descending order,
    with an optional limit on the total number of webs.

    Args:
        page (int): The current page number.
        page_size (int): The number of items per page.
        limit (int, optional): Maximum number of webs to fetch.
        user (User): The user whose webs are to be retrieved.

    Returns:
        dict: A JSON response containing the paginated list of webs and pagination metadata.
    """

    try:
        visibility = None
        if criteria:
            visibility = criteria[0].upper() + criteria[1:]

        if visibility:
            webs = list(
                Webs.find({"visibility": visibility, "userId": user["id"]}, {"_id": 0})
            )
        else:
            webs = list(
                Webs.find({"userId": user["id"]}, {"_id": 0}, sort=[("updated", -1)])
            )

        # pagination
        total_webs = len(webs)
        start_index = (page - 1) * page_size
        end_index = start_index + page_size
        paginated_webs = webs[start_index:end_index]

        next_cursor = page + 1 if end_index < total_webs else None
        prev_cursor = page - 1 if page > 1 else None

        return {
            "items": paginated_webs,
            "total": total_webs,
            "page": page,
            "page_size": page_size,
            "nextCursor": next_cursor,
            "prevCursor": prev_cursor,
        }

    except Exception as e:
        logger.error(f"Error fetching webs: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching webs {e}")


@router.get("/all")
async def get_webs(
    limit: int = 20,
    cursor: str = None,
    visibility=None,
    userId=None,
    userMakingRequest=Depends(manager.optional),
):
    """
    Retrieve public webs with cursor-based pagination.

    Parameters
    ----------
    limit : int
        Number of webs to return per page
    cursor : str
        Timestamp-based cursor for pagination

    Returns
    -------
    dict
        Dictionary containing webs and next cursor
    """
    authorized = userMakingRequest and userMakingRequest["id"] == userId
    try:
        query = {}
        if visibility:
            query["visibility"] = visibility
        if (
            userId
        ):  # if userId was specified, we're looking for profile webs that fit the scope of the user making the request
            query["userId"] = userId
            if not authorized:
                query["visibility"] = "Public"

        if cursor:
            query["updated"] = {"$lt": datetime.fromisoformat(cursor)}

        webs_list = list(
            Webs.find(query, {"_id": 0}).sort("updated", -1).limit(limit + 1)
        )
        total_webs = Webs.count_documents(query)

        has_next_page = len(webs_list) > limit
        next_cursor = None

        if has_next_page:
            webs_list = webs_list[:-1]
            next_cursor = webs_list[-1]["updated"]

        return {"result": webs_list, "nextCursor": next_cursor, "total": total_webs}

    except Exception as e:
        logger.error(f"Error fetching webs: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching webs {e}")


@router.get("/popular")
def get_popular_webs(limit: int = 10):
    """
    Retrieve popular webs with cursor-based pagination.

    Parameters
    ----------
    limit : int
        Number of webs to return per page

    Returns
    -------
    dict
        Dictionary containing webs and next cursor
    """
    try:
        pipeline = [
            {"$addFields": {"likesCount": {"$size": "$likes"}}},
            {"$sort": {"likesCount": -1}},
            {"$limit": limit},
            {"$project": {"_id": 0, "likesCount": 0}},
        ]
        top_webs = list(Webs.aggregate(pipeline))
        return {"result": top_webs}

    except Exception as e:
        logger.error(f"Error fetching webs: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching webs {e}")


@router.get("/liked/user")  # get all liked webs belonging to a user
def get_user_liked_webs(user: User = Depends(manager.required)):
    """
    Retrieve all webs liked by a user.

    Args:
        user (User): The user whose liked webs are to be retrieved.

    Returns:
        dict: A JSON response containing a list of liked webs sorted by creation date in descending order.
    """
    try:
        likedWebs = list(
            Webs.find({"likes": user["id"]}, {"_id": 0}, sort=[("created", -1)])
        )
        return {"result": likedWebs}

    except Exception as e:
        logger.error(f"Error fetching webs: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching webs {e}")


@router.post("/create")
def create_web_endpoint(
    createWebPayload: CreateWeb,
    background_tasks: BackgroundTasks,
    user=Depends(manager.required),
):
    """
    Create a new web.

    Args:
        createWebPayload (CreateWeb): The web to create.
        background_tasks (BackgroundTasks): A FastAPI BackgroundTasks instance.
        user (User): The user making the request.

    Returns:
        dict: A JSON response containing the ID of the newly created web.

    Raises:
        HTTPException: If web creation fails.
    """
    try:

        web_id = create_web(createWebPayload, user["id"])

        web_document = Webs.find_one({"webId": web_id, "userId": user["id"]})

        pinecone_document = web_document
        background_tasks.add_task(web_service.emebd_and_upsert_web, web_document)

        return {"result": web_id}

    except Exception as e:
        logger.error(f"Error creating web: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload/image/{web_id}")
async def upload_file(
    web_id: str,
    files: list[UploadFile] = File(..., description="Multiple files as UploadFile"),
    user=Depends(manager.required),
):
    """
    Upload images to a web.

    Args:
        web_id (str): The ID of the web to upload images to.
        files (list[UploadFile]): The images to upload.

    Returns:
        dict: A JSON response containing the URLs of the uploaded images.

    Raises:
        HTTPException: If the upload fails.
    """
    web = Webs.find_one({"webId": web_id, "userId": user["id"]})
    if not web:
        raise HTTPException(status_code=404, detail="Web not found")

    uploaded_image_urls = []
    try:
        for file in files:
            # sanitize filename
            safe_filename = secure_filename(file.filename)
            object_name = f"files/{user['id']}/{web_id}/images/{safe_filename}"

            temp_dir = "/tmp/web_uploads"
            os.makedirs(temp_dir, exist_ok=True)

            temp_path = os.path.join(temp_dir, f"{uuid.uuid4()}_{safe_filename}")

            try:
                contents = await file.read()
                with open(temp_path, "wb") as buffer:
                    buffer.write(contents)

                fileStorageResult = track_file_storage(
                    fileSizeBytes=len(contents), userId=user["id"], operation="$inc"
                )

                if not fileStorageResult:
                    raise HTTPException(
                        status_code=400, detail="Storage limit exceeded"
                    )

                s3_bucket.upload_file(
                    temp_path,
                    object_name,
                )

                url = f"https://{s3_bucket.bucket_name}.s3.{s3_bucket.region_name}.amazonaws.com/{object_name}"
                uploaded_image_urls.append(url)

                result = Webs.update_one(
                    {"webId": web_id, "userId": user["id"]},
                    {
                        "$push": {"imageKeys": object_name},
                        "$set": {"updated": datetime.now(UTC)},
                    },
                )

                if result.modified_count == 0:
                    raise HTTPException(status_code=404, detail="Web not found")

            except Exception as e:
                logger.error(f"Error uploading file {safe_filename}: {str(e)}")
                raise HTTPException(
                    status_code=500, detail=f"Error uploading file: {str(e)}"
                )
            finally:
                # clean up
                if os.path.exists(temp_path):
                    os.remove(temp_path)

        return {"imageUrls": uploaded_image_urls}

    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/delete/image/{web_id}/{image_name}")
def delete_image(web_id: str, image_name: str, user=Depends(manager.required)):
    """
    Delete an image associated with a web.

    Args:
        web_id (str): The ID of the web the image belongs to.
        image_name (str): The name of the image to delete.
        user (User): The authenticated user making the request.

    Returns:
        dict: A JSON response with a result key indicating success.

    Raises:
        HTTPException: If the image is not found in S3, the web is not found, or if any other error occurs during the operation.
    """

    try:

        filepath = f"files/{user['id']}/{web_id}/images/{image_name}"

        try:
            response = s3_session_client.head_object(
                Bucket=s3_bucket.bucket_name, Key=filepath
            )
            file_size_bytes = response["ContentLength"]
        except ClientError as e:
            logger.error(f"Error retrieving object metadata: {e}")
            raise HTTPException(status_code=404, detail="Image not found in S3")

        result = Webs.update_one(
            {"webId": web_id, "userId": user["id"], "imageKeys": filepath},
            {"$pull": {"imageKeys": filepath}, "$set": {"updated": datetime.now(UTC)}},
        )

        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Web not found")

        s3_session_client.delete_object(Bucket=s3_bucket.bucket_name, Key=filepath)

        track_file_storage(
            fileSizeBytes=file_size_bytes, userId=user["id"], operation="$dec"
        )

        return {"result": True}

    except Exception as e:
        logger.error(f"Error deleting image: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/images/web/{web_id}")
def get_web_images(web_id: str):
    """
    Retrieve all image URLs associated with a given web.

    Args:
        web_id (str): The ID of the web to retrieve images for.

    Returns:
        dict: A JSON response containing a list of image URLs.

    Raises:
        HTTPException: If the web is not found, raises a 404 error.
        HTTPException: If there is an error while generating URLs, raises a 500 error.
    """
    try:
        web = Webs.find_one({"webId": web_id})
        if not web:
            raise HTTPException(status_code=404, detail=f"Web not found!")

        imageKeys = web.get("imageKeys", [])
        urls = []

        for key in imageKeys:
            url = f"https://{settings.cloudfront_domain}/{key}"
            urls.append(url)

        return {"result": urls}

    except ClientError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/delete")
def delete_web(
    webId: str, background_tasks: BackgroundTasks, user=Depends(manager.required)
):
    """
    Delete a web and all associated sources, images, documents, and embeddings.
    """
    try:
        web_to_delete = Webs.find_one_and_delete({"webId": webId, "userId": user["id"]})
        if not web_to_delete:
            logger.info(f"Web {webId} not found or not owned by user {user['id']}")
            return {"result": False}

        logger.info(f"Web {webId} deleted by user {user['id']}")

        # handle embeddings in the background
        background_tasks.add_task(
            web_service.delete_web_embeddings, webId=webId, userId=user["id"]
        )

        # clean up in S3
        path_to_clean = f"files/{user['id']}/{webId}"

        delete_keys = []
        total_bytes_to_decrement = 0

        paginator = s3_session_client.get_paginator("list_objects_v2").paginate(
            Bucket=s3_bucket.bucket_name, Prefix=path_to_clean
        )

        for page in paginator:
            if "Contents" in page:
                for obj in page["Contents"]:
                    delete_keys.append({"Key": obj["Key"]})
                    total_bytes_to_decrement += obj["Size"]

        if delete_keys:
            s3_session_client.delete_objects(
                Bucket=s3_bucket.bucket_name, Delete={"Objects": delete_keys}
            )
            logger.info(f"Deleted {len(delete_keys)} files from S3 for web {webId}")

            # deduct combined storage from user's account
            track_file_storage(
                fileSizeBytes=total_bytes_to_decrement,
                userId=user["id"],
                operation="$dec",
            )

        return {"result": True}

    except Exception as e:
        logger.error(f"Error deleting web: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/update/{webId}")
def update_web(
    webId: str,
    updateWebPayload: UpdateWeb,
    background_tasks: BackgroundTasks,
    user=Depends(manager.required),
):
    """
    Update a web.

    Args:
        webId (str): The ID of the web to update.
        config (UpdateWeb): The new configuration for the web.
        user (User): The user making the request.

    Returns:
        dict: A JSON response with a result key.
    """
    try:
        web = Webs.find_one({"webId": webId, "userId": user["id"]})
        if not web:
            raise HTTPException(status_code=404, detail="Web not found")

        update_fields = updateWebPayload.model_dump(exclude_none=True)
        update_fields["updated"] = datetime.now(UTC)

        background_tasks.add_task(web_service.update_emebeddings, webId, update_fields)

        result = Webs.update_one(
            {"webId": webId, "userId": user["id"]}, {"$set": update_fields}
        )

        if result.modified_count == 0:
            raise HTTPException(
                status_code=404, detail="Web not found or no changes applied"
            )

        return {"result": True}

    except Exception as e:
        logger.error(f"Error updating web: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/id")
def get_web_by_id(webId: str, user=Depends(manager.optional)):
    """
    Retrieve a web by its ID.

    Args:
        webId (str): The ID of the web to retrieve.
        user (Optional[User]): The user making the request. Defaults to None.

    Returns:
        dict: A JSON response containing the web data if found.

    Raises:
        HTTPException: If the web is not found, raises a 404 error.
    """

    try:
        web: Web = Webs.find_one({"webId": webId}, {"_id": 0})

        if not web or (
            web["visibility"] == "Private"
            and not user
            and user.get("id", "") != web["userId"]
        ):
            raise HTTPException(status_code=404, detail="Item not found")
        else:
            _ = configure_chat(webId=webId)
            return {"result": web}

    except Exception as e:
        logger.error(f"Error getting web by id: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/like/{web_id}")
def like_web(web_id: str, user=Depends(manager.required)):
    """
    Like a web for a user.

    Args:
        web_id (str): The ID of the web to like.
        user (User): The user making the request.

    Raises:
        HTTPException: If the web is already liked or not found.

    Returns:
        dict: A JSON response with the updated number of likes for the web.
    """

    try:
        result = Webs.find_one_and_update(
            {"webId": web_id, "likes": {"$ne": user["id"]}},
            {"$addToSet": {"likes": user["id"]}},
            return_document=ReturnDocument.AFTER,
        )
        if not result:
            raise HTTPException(
                status_code=400, detail="Already liked or web not found"
            )
        return {"result": len(result["likes"])}

    except Exception as e:
        logger.error(f"Error liking web: {str(e)}")


@router.post("/unlike/{web_id}")
def unlike_web(web_id: str, user=Depends(manager.required)):
    """
    Unlike a web for a user.

    Args:
        web_id (str): The ID of the web to unlike.
        user (User): The user making the request.

    Raises:
        HTTPException: If the web is not liked yet or not found.

    Returns:
        dict: A JSON response with the updated number of likes for the web.
    """
    try:
        result = Webs.find_one_and_update(
            {"webId": web_id, "likes": user["id"]},
            {"$pull": {"likes": user["id"]}},
            return_document=ReturnDocument.AFTER,
        )
        if not result:
            raise HTTPException(
                status_code=400, detail="Not liked yet or web not found"
            )
        return {"result": len(result["likes"])}

    except Exception as e:
        logger.error(f"Error unliking web: {str(e)}")


@router.get("/saved/user")
def get_user_saved_webs(user=Depends(manager.required)):
    try:

        result = Webs.find({"webId": {"$in": user["websSaved"]}}, {"_id": 0})
        return {"result": result}

    except Exception as e:
        logger.error(f"Error getting user saved webs: {str(e)}")


@router.patch("/add/tag/{web_id}/{tag}")
def add_tag(web_id: str, tag: str, user=Depends(manager.required)):
    try:

        formatted_tag = tag.lower()
        Webs.update_one(
            {"webId": web_id, "userId": user["id"]},
            {"$addToSet": {"tags": formatted_tag}},
        )
        return {"result": True}

    except Exception as e:
        logger.error(f"Error adding tag: {str(e)}")


@router.patch("/remove/tag/{web_id}/{tag}")
def remove_tag(web_id: str, tag: str, user=Depends(manager.required)):

    try:

        formatted_tag = tag.lower()
        Webs.update_one(
            {"webId": web_id, "userId": user["id"]},
            {"$pull": {"tags": formatted_tag}},
        )

        return {"result": True}

    except Exception as e:
        logger.error(f"Error removing tag: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/iterate/{web_id}")
def iterate_web(
    web_id: str,
    iteratePayload: IterateWeb,
    background_task: BackgroundTasks,
    user=Depends(manager.required),
):
    """
    Iterate over a given web and create a new web with the same sources but with a new name and description.

    Steps:
    1. Look up the original web and user.
    2. Create a new web (generates a new webId).
    3. Copy sources from the original web to the new one via Neo4j.
    4. Update the new web in Mongo with the new sourceIds and iteration info.
    5. Queue embedding task.
    """
    try:
        # get original web + owner
        web_to_iterate: Web | None = Webs.find_one({"webId": web_id})
        if not web_to_iterate:
            raise HTTPException(status_code=404, detail="Original web not found")

        associated_user: User | None = Users.find_one(
            {"id": web_to_iterate["userId"]}, {"_id": 0}
        )
        if not associated_user:
            raise HTTPException(status_code=404, detail="Owner not found")

        # create a new web first to generate a new webId
        create_web_payload = CreateWeb(
            name=iteratePayload.name,
            description=iteratePayload.description,
            visibility="Private",
            tags=web_to_iterate.get("tags", []),
            sourceIds=[],
            imageKeys=[],
            enableAIConnections=False,
            showcase=False,
        )
        new_web_id = create_web(create_web_payload, user["id"])

        # copy sources in Neo4j to the new web
        try:
            _, new_source_ids = neo4j_client.copy_sources_to_new_web(
                original_web_id=web_id,
                new_web_id=new_web_id,
                new_user_id=user["id"],
                with_connections=iteratePayload.withConnections,
            )
        except Exception as e:
            logger.error(f"Neo4j copy error: {str(e)}")
            raise HTTPException(status_code=500, detail="Error copying sources")

        # update new web in MongoDB with sourceIds and iteratedFrom
        Webs.update_one(
            {"webId": new_web_id},
            {
                "$set": {
                    "sourceIds": new_source_ids,
                    "iteratedFrom": associated_user["id"],
                    "updated": datetime.now(UTC),
                }
            },
        )

        Webs.update_one(
            {"webId": web_id},
            {"$push": {"iterations": user["id"]}},
        )

        # queue embedding
        web_doc = Webs.find_one({"webId": new_web_id})
        if web_doc:
            background_task.add_task(web_service.emebd_and_upsert_web, web_doc)
            logger.info(f"Queued embedding for new web: {new_web_id}")
            background_task.add_task(
                source_service.embed_iterated_sources, new_source_ids
            )
            logger.info(f"Queued embedding for new sources: {new_source_ids}")

        return {"result": new_web_id}

    except Exception as e:
        logger.error(f"Error iterating web: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error iterating web: {str(e)}")


@router.get("/search")
def search_webs(
    query: str,
    visibility: Optional[Literal["Public", "Private"]] = Query(
        None, alias="visibility"
    ),
    userId: Optional[str] = None,
    webId: Optional[str] = None,
    user=Depends(manager.optional),
):
    """
    Run a semantic search for webs.

    Args:
        query (str): The search query to run.
        visibility (Optional[Literal["Public", "Private"]], optional): Filter search results by visibility. Defaults to None.
        userId (Optional[str], optional): Filter search results by user ID. Defaults to None.
        webId (Optional[str], optional): Filter search results by web ID. Defaults to None.
        user (User, optional): The user making the request. Defaults to None.

    Returns:
        dict: A JSON response containing the search results.
    """
    try:
        filter = {}
        if visibility:
            filter["visibility"] = {"$eq": visibility}
            if visibility == "Private":
                if not user:
                    raise HTTPException(status_code=401, detail="Unauthorized")
                filter["userId"] = {"$eq": user["id"]}
        if userId:
            filter["userId"] = {"$eq": userId}
        if webId:
            filter["webId"] = {"$eq": webId}

        search_info: Search = {
            "query": query,
            "timestamp": datetime.now(UTC),
            "userId": user["id"] if user else None,
            "filters": filter,
        }
        Searches.insert_one(search_info)
        results = pinecone_client.run_semantic_search(
            query, namespace="webs", filter=filter, limit=20
        )
        return {"result": results}

    except Exception as e:
        logger.error(f"Error running semantic search: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error running semantic search: {e}"
        )


@router.get("/contributers/{web_id}")
def get_web_contributors(web_id: str, user=Depends(manager.optional)):

    try:
        web = Webs.find_one({"webId": web_id})
        if not web:
            raise HTTPException(status_code=404, detail=f"Web not found!")

        contributers = []
        for iteration in web["iterations"]:
            user = Users.find_one({"id": iteration}, {"_id": 0})
            if user:
                publicUser = PublicUser(**user)
                contributers.append(publicUser.model_dump())

        return {"result": contributers}

    except Exception as e:
        logger.error(f"Error getting web contributers: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error getting web contributers: {e}"
        )


class ExportGraphContext(BaseModel):
    webId: str
    selectedSources: list[str]
    asMarkdown: bool = False


@router.post("/export/graph/context")
def export_graph_context(
    payload: ExportGraphContext, user: User = Depends(manager.optional)
):

    try:
        web = Webs.find_one({"webId": payload.webId})

        if not web:
            raise HTTPException(status_code=404, detail=f"Web not found!")

        result = neo4j_client.retreive_graph(
            webId=payload.webId, selectedNodes=payload.selectedSources
        )

        web = clean_unicode(web)
        result = clean_unicode(result)

        logger.info(f"Exported graph context for web {payload.webId}")

        if payload.asMarkdown:
            markdown_content = (
                f"# {web['name']}\n\n{json.dumps(result, indent=2, ensure_ascii=True)}"
            )
            safe_filename = clean_unicode(web["name"][:40])
            filename = f"{safe_filename}.md"

            def generate():
                yield markdown_content.encode("utf-8")

            return StreamingResponse(
                generate(),
                media_type="text/markdown; charset=utf-8",
                headers={"Content-Disposition": f'attachment; filename="{filename}"'},
            )

        return {"result": result}

    except Exception as e:
        logger.error(f"Error exporting graph context: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error exporting graph context: {e}"
        )


class InviteContributer(BaseModel):
    webId: str
    emailToInvite: str


@router.post("/invite/contributer/")  # IN PROGRESS
def invite_contributer(
    payload: InviteContributer, user: User = Depends(manager.required)
):
    associated_web = Webs.find_one({"webId": payload.webId})
    if not associated_web:
        raise HTTPException(status_code=404, detail=f"Web not found!")

    redirect: str = f"{settings.next_url}/auth/invite"

    resp = stytch_client.magic_links.email.invite(
        email=payload.emailToInvite, invite_magic_link_url=redirect
    )
    return {"result": payload.emailToInvite}


@router.post("/revoke/invite/")  # IN PROGRESS
def revoke_invite(payload: InviteContributer, _=Depends(manager.required)):

    existing_user = Users.find_one({"email": payload.emailToInvite})
    if existing_user:
        existing_user = PublicUser(**existing_user)
        # here we need to send an email to the user telling them they've been invited to a web
        return {"result": existing_user.model_dump()}

    resp = stytch_client.magic_links.email.revoke(
        email=payload.emailToInvite,
        invite_magic_link_url=f"{settings.next_url}/auth/invite",
    )
    return {"result": resp.status_code}
