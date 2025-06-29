from typing import Literal, Optional
from fastapi import APIRouter, HTTPException, Depends
from src.db.neo4j import client as neo4j_client
from src.models.index import User
from src.routes.auth.utils import manager
from src.lib.logger.index import logger
from src.models.index import Webs, Contributors, Contributor, Users, Web
from src.core.config import settings
from src.lib.stytch.index import client as stytch_client
from src.models.index import PublicUser
from pydantic import BaseModel
from datetime import datetime
from pytz import UTC
import uuid

router = APIRouter()


class InviteContributer(BaseModel):
    emailToInvite: str


@router.post("/invite/web/{web_id}/contributor")
def invite_contributer(
    web_id: str,
    payload: InviteContributer,
    owner: User = Depends(manager.required.OWNER),
):
    try:
        invite_email = payload.emailToInvite

        if owner.email == invite_email:
            raise HTTPException(status_code=400, detail="You cannot invite yourself")

        # check for existing contributor relationship
        existing_relationship = Contributors.find_one(
            {"email": invite_email, "webId": web_id}, {"_id": 0}
        )

        if existing_relationship:
            existing_contrib = Contributor(**existing_relationship)
            if existing_contrib.pending:
                raise HTTPException(
                    status_code=400, detail="Invitation already sent to this email"
                )
            raise HTTPException(
                status_code=400, detail="User already has access to this project"
            )

        # check if user already exists
        existing_user_doc = Users.find_one({"email": invite_email}, {"_id": 0})

        if existing_user_doc:
            existing_user = User(**existing_user_doc)
            logger.info(f"User found: {existing_user}")

            # check if user is already a contributor
            if Contributors.find_one(
                {"userId": existing_user.id, "webId": web_id}, {"_id": 0}
            ):
                logger.info("User already has access to this project")
                raise HTTPException(
                    status_code=400, detail="User already has access to this project"
                )

            contributor_info = Contributor(
                contributorId=str(uuid.uuid4()),
                userId=existing_user.id,
                username=existing_user.username,
                email=existing_user.email,
                webId=web_id,
                invitedBy=owner.id,
            )

            Contributors.insert_one(contributor_info.model_dump())
            logger.info(f"Contributor invited: {contributor_info.contributorId}")
            return {"result": PublicUser(**existing_user.model_dump())}

        elif not existing_user_doc:
            logger.info(f"User not found: {invite_email}..")
            raise HTTPException(status_code=404, detail="User not found")

        # if user doesn't exist, invite via email and create pending contributor record

        """

        logger.info(f"User not found: {invite_email}... Creating user in limbo")

        redirect_url = f"{settings.next_url}/auth/invite" # TODO: add functionality to send invite to non-existing users

        try:
            resp = stytch_client.magic_links.email.invite(
                email=invite_email, invite_magic_link_url=redirect_url
            )
        except Exception as e:
            logger.error(f"Error sending invite: {e}")
            raise HTTPException(status_code=500, detail=str(e))

        if not resp or not resp.user_id:
            raise HTTPException(
                status_code=500,
                detail="Failed to send invite. This might be due to an invalid email address.",
            )

        contributor_info = Contributor(
            contributorId=str(uuid.uuid4()),
            userId=resp.user_id,
            username=None,
            email=invite_email,
            webId=web_id,
            invitedBy=owner.id,
        )

        Contributors.insert_one(contributor_info.model_dump())
        logger.info(f"Pending contributor invited: {resp.user_id}")

        return {"result": resp.user_id}
        """
    except Exception as e:
        logger.error(f"Error inviting contributor: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/revoke/invite/web/{web_id}/contributor/{contributor_id}")
def revoke_invite(
    web_id: str, contributor_id: str, _: User = Depends(manager.required.OWNER)
):
    try:
        existing_contributor = Contributors.find_one(
            {"contributorId": contributor_id, "webId": web_id}, {"_id": 0}
        )
        if existing_contributor:
            existing_contributor = Contributor(**existing_contributor)
            Contributors.delete_one(
                {"contributorId": existing_contributor.contributorId}
            )
            logger.info(
                f"Contributor revoked invite: {existing_contributor.email} with access level {existing_contributor.accessLevel}. Invited by {existing_contributor.invitedBy}"
            )
            return {"result": True}

        raise HTTPException(status_code=404, detail="Contributor not found")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error revoking invite: {e}")
        raise HTTPException(status_code=500, detail="Failed to revoke invite")


@router.get("/all/web/{web_id}")
def get_all_contributors_for_web(web_id: str, _: User = Depends(manager.optional.READ)):
    try:
        contributors = Contributors.find({"webId": web_id}, {"_id": 0})
        contributors = list(contributors)
        logger.info(f"Contributors for web {web_id}: {contributors}")
        return {"result": contributors}

    except Exception as e:
        logger.error(f"Error getting contributors: {e}")
        raise HTTPException(status_code=500, detail="Failed to get contributors")


class ToggleContributorRole(BaseModel):
    role: Literal["owner", "write", "read"]


@router.patch("/toggle/web/{web_id}/contributor/{contributor_id}")
def toggle_contributor_role(
    web_id: str,
    contributor_id: str,
    payload: ToggleContributorRole,
    _: User = Depends(manager.required.OWNER),
):
    try:
        existing_contributor = Contributors.find_one(
            {"contributorId": contributor_id, "webId": web_id}, {"_id": 0}
        )
        if existing_contributor:
            existing_contributor = Contributor(**existing_contributor)
            Contributors.update_one(
                {"contributorId": existing_contributor.contributorId},
                {"$set": {"accessLevel": payload.role}},
            )
            logger.info(
                f"Contributor role toggled: {existing_contributor.contributorId}"
            )
            return {"result": True}

        raise HTTPException(status_code=404, detail="Contributor not found")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error toggling contributor role: {e}")
        raise HTTPException(status_code=500, detail="Failed to toggle contributor role")


@router.delete("/delete/web/{web_id}/contributor/{contributor_id}")
def delete_contributor(
    web_id: str, contributor_id: str, _: User = Depends(manager.required.OWNER)
):
    try:
        existing_contributor = Contributors.find_one(
            {"contributorId": contributor_id, "webId": web_id}, {"_id": 0}
        )
        if existing_contributor:
            existing_contributor = Contributor(**existing_contributor)
            Contributors.delete_one(
                {"contributorId": existing_contributor.contributorId}
            )
            logger.info(f"Contributor deleted: {existing_contributor.contributorId}")
            return {"result": True}

        raise HTTPException(status_code=404, detail="Contributor not found")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting contributor: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete contributor")


@router.patch("/accept/invite/web/{web_id}/contributor/{user_id}")
def accept_invite(web_id: str, user_id: str, user: User = Depends(manager.required)):
    try:
        existing_contributor = Contributors.find_one(
            {"userId": user_id, "webId": web_id}, {"_id": 0}
        )
        if existing_contributor:
            existing_contributor = Contributor(**existing_contributor)
            Contributors.update_one(
                {"userId": existing_contributor.userId, "webId": web_id},
                {
                    "$set": {
                        "pending": False,
                        "acceptedAt": datetime.now(UTC),
                        "username": user.username,
                    }
                },
            )
            logger.info(
                f"Contributor accepted invite: {existing_contributor.email} with access level {existing_contributor.accessLevel}. Invited by {existing_contributor.invitedBy}"
            )
            return {"result": True}

        raise HTTPException(status_code=404, detail="Contributor not found")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error accepting invite: {e}")
        raise HTTPException(status_code=500, detail="Failed to accept invite")


@router.delete("/reject/invite/web/{web_id}/contributor/{user_id}")
def reject_invite(web_id: str, user_id: str, user: User = Depends(manager.required)):
    try:
        existing_contributor = Contributors.find_one(
            {"userId": user_id, "webId": web_id}, {"_id": 0}
        )
        if existing_contributor:
            existing_contributor = Contributor(**existing_contributor)
            Contributors.delete_one(
                {"userId": existing_contributor.userId, "webId": web_id}
            )
            logger.info(
                f"Contributor rejected invite: {existing_contributor.email} with access level {existing_contributor.accessLevel}. Invited by {existing_contributor.invitedBy}"
            )
            return {"result": True}

        raise HTTPException(status_code=404, detail="Contributor not found")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error rejecting invite: {e}")
        raise HTTPException(status_code=500, detail="Failed to reject invite")


@router.get("/check/authorized/web/{web_id}")
def check_authorized(
    web_id: str, user: Optional[User] = Depends(manager.optional.READ)
):
    try:
        if not user:
            return {"result": None, "invite": False, "inviter": None}

        # first check if user is the resource owner
        web = Webs.find_one({"webId": web_id}, {"_id": 0})
        if web and Web(**web).userId == user.id:
            return {"result": "owner", "invite": False, "inviter": None}

        # then check if user is a contributor
        existing_contributor = Contributors.find_one(
            {"webId": web_id, "userId": user.id}, {"_id": 0}
        )

        if existing_contributor:
            existing_contributor = Contributor(**existing_contributor)
            status = "invite" if existing_contributor.pending else "contributor"
            logger.info(
                f"Found authorized {status}: {existing_contributor.email} with access level {existing_contributor.accessLevel}. Invited by {existing_contributor.invitedBy}"
            )
            return {
                "result": existing_contributor.accessLevel,
                "invite": existing_contributor.pending,
                "inviter": existing_contributor.invitedBy,
            }
        # no access found
        return {"result": None, "invite": False, "inviter": None}

    except Exception as e:
        logger.error(f"Error checking authorized: {e}")
        raise HTTPException(status_code=500, detail="Failed to check authorized")
