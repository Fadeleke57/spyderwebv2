from typing import Literal
from fastapi import APIRouter, HTTPException, Depends
from src.db.neo4j import client as neo4j_client
from src.models.index import User
from src.routes.auth.utils import manager
from src.lib.logger.index import logger
from src.models.index import Webs, Contributors, Contributor, Users
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


@router.post("/invite/web/{web_id}/contributor")  # IN PROGRESS
def invite_contributer(
    web_id: str,
    payload: InviteContributer,
    owner: User = Depends(manager.required.OWNER),
):
    associated_web = Webs.find_one({"webId": web_id})
    if not associated_web:
        raise HTTPException(status_code=404, detail=f"Web not found!")

    possible_existing_user = Users.find_one({"email": payload.emailToInvite})

    if possible_existing_user:

        user = User(**possible_existing_user)
        contributer_info = Contributor(
            contributorId=str(uuid.uuid4()),
            userId=user.id,
            webId=web_id,
            invitedBy=owner.id,
            role="Contributer",
            created=datetime.now(UTC).isoformat().replace("+00:00", "Z"),
            updated=datetime.now(UTC).isoformat().replace("+00:00", "Z"),
        )
        Contributors.insert_one(contributer_info.model_dump())
        return {"result": payload.emailToInvite}

    else:
        # invite a user and place them in limbo
        redirect: str = f"{settings.next_url}/auth/invite"
        resp = stytch_client.magic_links.email.invite(
            email=payload.emailToInvite, invite_magic_link_url=redirect
        )
        return {"result": resp.status_code}


@router.post("/revoke/invite/web/{web_id}/contributor/{contributor_id}")
def revoke_invite(
    web_id: str, contributor_id: str, owner: User = Depends(manager.required.OWNER)
):
    try:

        existing_contributor = Contributors.find_one({"contributorId": contributor_id})
        if existing_contributor:
            existing_contributor = Contributor(**existing_contributor)
            Contributors.delete_one(
                {"contributorId": existing_contributor.contributorId}
            )
            return {"result": True}

        return {"result": False}

    except Exception as e:
        logger.error(f"Error revoking invite: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/all/{web_id}")
def get_all_contributors_for_web(
    web_id: str, user: User = Depends(manager.optional.READ)
):
    try:
        contributors = Contributors.find({"webId": web_id})
        return {"result": list(contributors)}

    except Exception as e:
        logger.error(f"Error getting contributors: {e}")
        raise HTTPException(status_code=500, detail=str(e))


class ToggleContributorRole(BaseModel):
    role: Literal["owner", "write", "read"]


@router.patch("/toggle/web/{web_id}/contributor/{contributor_id}")
def toggle_contributor_role(
    web_id: str,
    contributor_id: str,
    payload: ToggleContributorRole,
    owner: User = Depends(manager.required.OWNER),
):
    try:
        existing_contributor = Contributors.find_one({"contributorId": contributor_id})
        if existing_contributor:
            existing_contributor = Contributor(**existing_contributor)
            Contributors.update_one(
                {"contributorId": existing_contributor.contributorId},
                {"$set": {"accessLevel": payload.role}},
            )
            return {"result": True}

        return {"result": False}

    except Exception as e:
        logger.error(f"Error toggling contributor role: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/delete/web/{web_id}/contributor/{contributor_id}")
def delete_contributor(
    web_id: str, contributor_id: str, owner: User = Depends(manager.required.OWNER)
):
    try:
        existing_contributor = Contributors.find_one({"contributorId": contributor_id})
        if existing_contributor:
            existing_contributor = Contributor(**existing_contributor)
            Contributors.delete_one(
                {"contributorId": existing_contributor.contributorId}
            )
            return {"result": True}

        return {"result": False}

    except Exception as e:
        logger.error(f"Error deleting contributor: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/accept/invite/web/{web_id}/contributor/{contributor_id}")
def accept_invite(
    web_id: str, contributor_id: str, user: User = Depends(manager.required)
):
    try:
        existing_contributor = Contributors.find_one({"contributorId": contributor_id})
        if existing_contributor:
            existing_contributor = Contributor(**existing_contributor)
            Contributors.update_one(
                {"contributorId": existing_contributor.contributorId},
                {"$set": {"pending": False}},
            )
            return {"result": True}

        return {"result": False}

    except Exception as e:
        logger.error(f"Error accepting invite: {e}")
        raise HTTPException(status_code=500, detail=str(e))
