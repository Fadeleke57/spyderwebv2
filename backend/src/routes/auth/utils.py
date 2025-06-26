from typing import Optional, Tuple, Callable
from fastapi import HTTPException, Cookie, Header, Depends
from enum import Enum
from src.lib.stytch.index import client as stytch_client, StytchError, StytchUser
from src.lib.logger.index import logger
from src.models.index import Users, User, Web, Contributor, Webs, Contributers


# --- Authentication Error ---
class AuthenticationError(Exception):
    def __init__(self, message: str, status_code: int = 401):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


# --- Token Extraction ---
class TokenExtractor:
    @staticmethod
    def extract_bearer_token(authorization: Optional[str]) -> Optional[Tuple[str, str]]:
        if not authorization:
            return None
        parts = authorization.split()
        if len(parts) != 2 or parts[0] != "Bearer":
            raise AuthenticationError(
                "Invalid Authorization header format. Expected 'Bearer <token>'."
            )
        return parts[1], "Bearer token"

    @staticmethod
    def extract_cookie_token(
        stytch_session_jwt: Optional[str],
    ) -> Optional[Tuple[str, str]]:
        if not stytch_session_jwt:
            return None
        return stytch_session_jwt, "Cookie (stytch_session_jwt)"


# --- Stytch Auth ---
class StytchAuthenticator:
    @staticmethod
    def authenticate_bearer_token(token: str) -> StytchUser:
        resp = stytch_client.idp.introspect_access_token_local(access_token=token)
        stytch_user = stytch_client.users.get(user_id=resp.subject)
        if not stytch_user:
            raise AuthenticationError("User not found in Stytch after authentication")
        return stytch_user

    @staticmethod
    def authenticate_session_jwt(token: str) -> StytchUser:
        resp = stytch_client.sessions.authenticate(session_jwt=token)
        return resp.user


# --- Local DB Lookup ---
class UserRepository:
    @staticmethod
    def find_user_by_stytch_data(stytch_user: StytchUser) -> User:
        user_id = stytch_user.external_id or stytch_user.user_id
        user = Users.find_one({"id": user_id})
        if not user:
            raise AuthenticationError(
                "User not found in local system after authentication"
            )
        return User(**user)


# --- Access Level Enum ---
class AccessLevel(str, Enum):
    OWNER = "owner"
    READ = "read"
    WRITE = "write"


# --- Auth Service ---
class AuthService:
    def __init__(self):
        self.token_extractor = TokenExtractor()
        self.stytch_auth = StytchAuthenticator()
        self.user_repo = UserRepository()
        self.contributors = Contributers

    def _authenticate_token(
        self, token: str, auth_method: str, is_bearer: bool
    ) -> User:
        try:
            stytch_user = (
                self.stytch_auth.authenticate_bearer_token(token)
                if is_bearer
                else self.stytch_auth.authenticate_session_jwt(token)
            )
            user = self.user_repo.find_user_by_stytch_data(stytch_user)
            logger.info(
                f"Authenticated user_id: {stytch_user.external_id or stytch_user.user_id} via {auth_method}"
            )
            return user
        except StytchError as e:
            logger.warning(f"Stytch authentication error: {e}")
            detail = f"Authentication failed: {getattr(e, 'details', str(e))}"
            raise AuthenticationError(detail)

    def authenticate_user(
        self,
        authorization: Optional[str] = None,
        stytch_session_jwt: Optional[str] = None,
    ) -> User:
        bearer_result = self.token_extractor.extract_bearer_token(authorization)
        if bearer_result:
            token, auth_method = bearer_result
            return self._authenticate_token(token, auth_method, is_bearer=True)
        cookie_result = self.token_extractor.extract_cookie_token(stytch_session_jwt)
        if cookie_result:
            token, auth_method = cookie_result
            return self._authenticate_token(token, auth_method, is_bearer=False)
        raise AuthenticationError(
            f"Not authenticated: Missing token: {authorization}, {stytch_session_jwt}"
        )

    def check_web_access(
        self, user: Optional[User], web_id: str, required_level: AccessLevel
    ):
        web = Webs.find_one({"webId": web_id})
        if not web:
            raise HTTPException(status_code=404, detail="Web not found")

        web = Web(**web)
        # Owner has all access levels
        if user and web.userId == user.id:
            return

        # For public webs, everyone gets read access
        if web.visibility == "Public" and required_level == AccessLevel.READ:
            return

        if not user:
            raise HTTPException(status_code=403, detail="Not authorized")

        # For all other cases (private webs or write/owner access), check contributor status
        contributor = self.contributors.find_one({"webId": web_id, "userId": user.id})
        if not contributor:
            raise HTTPException(status_code=403, detail="Not authorized")
        contributor = Contributor(**contributor)
        contributor_level = contributor.accessLevel

        # Check access level hierarchy
        if required_level == AccessLevel.OWNER:
            # Only actual owner can have OWNER access (already handled above)
            raise HTTPException(status_code=403, detail="Owner access required")
        elif required_level == AccessLevel.WRITE:
            # Need WRITE or OWNER access
            if contributor_level not in [AccessLevel.WRITE, AccessLevel.OWNER]:
                raise HTTPException(status_code=403, detail="Write access required")
        elif required_level == AccessLevel.READ:
            # Any access level (READ, WRITE, OWNER) grants READ access
            if contributor_level not in [
                AccessLevel.READ,
                AccessLevel.WRITE,
                AccessLevel.OWNER,
            ]:
                raise HTTPException(status_code=403, detail="Read access required")


auth_service = AuthService()


# --- FastAPI Dependencies ---
async def get_current_user_from_token(
    authorization: Optional[str] = Header(None),
    stytch_session_jwt: Optional[str] = Cookie(None),
) -> User:
    try:
        return auth_service.authenticate_user(authorization, stytch_session_jwt)
    except AuthenticationError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


async def get_optional_user_from_token(
    authorization: Optional[str] = Header(None),
    stytch_session_jwt: Optional[str] = Cookie(None),
) -> Optional[User]:
    try:
        return auth_service.authenticate_user(authorization, stytch_session_jwt)
    except AuthenticationError as e:
        if e.status_code == 401:
            logger.info(f"Optional authentication failed: {e.message}")
            return None
        raise HTTPException(status_code=e.status_code, detail=e.message)


# --- Dependency Factory ---
def require_web_access_level(required_level: AccessLevel) -> Callable:
    async def dependency(
        web_id: str,
        user: Optional[User] = Depends(get_current_user_from_token),
    ) -> Optional[User]:
        auth_service.check_web_access(user, web_id, required_level)
        return user

    return dependency


# --- NEW: Optional Web Access Factory ---
def optional_web_access_level(required_level: AccessLevel) -> Callable:
    async def dependency(
        web_id: str,
        user: Optional[User] = Depends(get_optional_user_from_token),
    ) -> Optional[User]:
        auth_service.check_web_access(user, web_id, required_level)
        return user

    return dependency


# --- Manager Class with .required.READ / .WRITE ---
class AuthManager:
    def __init__(self):
        self.required = self.Required()
        self.optional = self.Optional()
        logger.info("AUTH MANAGER INITIALIZED")

    class Required:
        def __init__(self):
            # These are now direct dependency functions, not callable classes
            self.READ = require_web_access_level(AccessLevel.READ)
            self.WRITE = require_web_access_level(AccessLevel.WRITE)
            self.OWNER = require_web_access_level(AccessLevel.OWNER)

        async def __call__(
            self,
            authorization: Optional[str] = Header(None),
            stytch_session_jwt: Optional[str] = Cookie(None),
        ) -> User:
            """
            For basic authentication without web access check.
            Usage: Depends(manager.required)
            """
            try:
                return auth_service.authenticate_user(authorization, stytch_session_jwt)
            except AuthenticationError as e:
                raise HTTPException(status_code=e.status_code, detail=e.message)

    class Optional:
        def __init__(self):
            # Use the new optional web access factory
            self.READ = optional_web_access_level(AccessLevel.READ)

        async def __call__(
            self,
            authorization: Optional[str] = Header(None),
            stytch_session_jwt: Optional[str] = Cookie(None),
        ) -> Optional[User]:
            return await get_optional_user_from_token(authorization, stytch_session_jwt)


manager = AuthManager()
