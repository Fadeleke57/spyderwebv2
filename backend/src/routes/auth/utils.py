from typing import Optional, Tuple
from fastapi import HTTPException, Cookie, Header
from src.lib.stytch.index import (
    client as stytchClient,
    StytchError,
    StytchUser
)
from src.lib.logger.index import logger
from src.models.index import Users, User


class AuthenticationError(Exception):
    def __init__(self, message: str, status_code: int = 401):
        """
        Initialize an AuthenticationError instance

        Args:
            message (str): The message to be passed to the HTTPException
            status_code (int, optional): The HTTP status code to be used in the HTTPException. Defaults to 401.
        """
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class TokenExtractor:
    @staticmethod
    def extract_bearer_token(authorization: Optional[str]) -> Optional[Tuple[str, str]]:
        """
        Extract the Bearer token from the Authorization header.

        Args:
            authorization (Optional[str]): The Authorization header value

        Returns:
            Optional[Tuple[str, str]]: The extracted token and its type, or None if no token is found or the format is invalid
        """
        if not authorization:
            return None
            
        parts = authorization.split()
        if len(parts) != 2 or parts[0] != "Bearer":
            raise AuthenticationError(
                "Invalid Authorization header format. Expected 'Bearer <token>'."
            )
        
        return parts[1], "Bearer token"
    
    @staticmethod
    def extract_cookie_token(stytch_session_jwt: Optional[str]) -> Optional[Tuple[str, str]]:
        """
        Extract the Stytch session JWT from the stytch_session_jwt cookie.

        Args:
            stytch_session_jwt (Optional[str]): The stytch_session_jwt cookie value

        Returns:
            Optional[Tuple[str, str]]: The extracted token and its type, or None if no token is found
        """
        if not stytch_session_jwt:
            return None
        return stytch_session_jwt, "Cookie (stytch_session_jwt)"


class StytchAuthenticator:
    """Handles Stytch authentication operations"""
    
    @staticmethod
    def authenticate_bearer_token(token: str) -> StytchUser:
        """
        Authenticate a Bearer token using Stytch.

        Args:
            token (str): The Bearer token to authenticate

        Returns:
            any: The authenticated Stytch user

        Raises:
            AuthenticationError: If the token is invalid or the user is not found in Stytch
        """
        resp = stytchClient.idp.introspect_access_token_local(access_token=token)
        stytch_user = stytchClient.users.get(user_id=resp.subject)
        
        if not stytch_user:
            raise AuthenticationError(
                "User not found in Stytch after authentication"
            )
        
        return stytch_user
    
    @staticmethod
    def authenticate_session_jwt(token: str) -> any:
        """
        Authenticate a session JWT using Stytch.

        Args:
            token (str): The session JWT to authenticate.

        Returns:
            any: The authenticated Stytch user.

        Raises:
            AuthenticationError: If the token is invalid or the user is not found in Stytch.
        """
        resp = stytchClient.sessions.authenticate(session_jwt=token)
        return resp.user


class UserRepository:    
    @staticmethod
    def find_user_by_stytch_data(stytch_user: StytchUser) -> User:
        """
        Find a user in the local system using Stytch user data.

        Args:
            stytch_user (any): The user object obtained from Stytch, containing information such as external_id or user_id.

        Returns:
            User: The corresponding user object from the local system.

        Raises:
            AuthenticationError: If the user is not found in the local system after authentication.
        """

        user_id = stytch_user.external_id or stytch_user.user_id
        user = Users.find_one({"id": user_id})
        
        if not user:
            raise AuthenticationError(
                "User not found in local system after authentication"
            )
        
        return user


class AuthService:    
    def __init__(self):
        """
        Initializes the AuthService with necessary components for authentication.

        Sets up instances of TokenExtractor for extracting tokens,
        StytchAuthenticator for handling Stytch authentication operations,
        and UserRepository for accessing user data within the local system.
        """
        self.token_extractor = TokenExtractor()
        self.stytch_auth = StytchAuthenticator()
        self.user_repo = UserRepository()
    
    def _authenticate_token(self, token: str, auth_method: str, is_bearer: bool) -> User:
        """
        Authenticates a user using a given token and authentication method.

        Args:
            token (str): The authentication token to be verified.
            auth_method (str): The authentication method used (e.g. Bearer, Cookie).
            is_bearer (bool): Whether the token is a Bearer token or a session JWT.

        Returns:
            User: The authenticated user object.

        Raises:
            AuthenticationError: If the authentication token is invalid or the user is not found in the local system.
        """
        try:
            if is_bearer:
                stytch_user = self.stytch_auth.authenticate_bearer_token(token)
            else:
                stytch_user = self.stytch_auth.authenticate_session_jwt(token)
            
            user = self.user_repo.find_user_by_stytch_data(stytch_user)
            
            user_id = stytch_user.external_id or stytch_user.user_id
            logger.info(
                f"Successfully authenticated user_id: {user_id} via {auth_method}"
            )
            
            return user
            
        except StytchError as e:
            logger.warning(f"Stytch authentication error with {auth_method}: {e}")
            detail = f"Authentication failed: {e.details.model_dump()}" if hasattr(e, 'details') else f"Stytch authentication error with {auth_method}: {e}"
            raise AuthenticationError(detail)
    
    def authenticate_user(
        self,
        authorization: Optional[str] = None,
        stytch_session_jwt: Optional[str] = None
    ) -> User:
        """
        Authenticates a user using either a Bearer token or a session JWT.

        This method attempts to extract and authenticate a Bearer token from the 
        Authorization header or a session JWT from a cookie. If a valid token is 
        found and authenticated, the corresponding user is returned. If no valid 
        token is found, an AuthenticationError is raised.

        Args:
            authorization (Optional[str]): The Authorization header value, potentially 
                                        containing a Bearer token.
            stytch_session_jwt (Optional[str]): The cookie value potentially containing 
                                                a session JWT.

        Returns:
            User: The authenticated user object.

        Raises:
            AuthenticationError: If no valid token is found or authentication fails.
        """
        bearer_result = self.token_extractor.extract_bearer_token(authorization)
        if bearer_result:
            token, auth_method = bearer_result
            logger.info(f"Received Bearer token: {token}")
            return self._authenticate_token(token, auth_method, is_bearer=True)
        
        # try cookie token
        cookie_result = self.token_extractor.extract_cookie_token(stytch_session_jwt)
        if cookie_result:
            token, auth_method = cookie_result
            return self._authenticate_token(token, auth_method, is_bearer=False)
        
        # no valid token found
        logger.warning("Missing authentication token (neither Bearer token nor cookie found).")
        raise AuthenticationError("Not authenticated: Missing token")

auth_service = AuthService()

async def get_current_user_from_token(
    authorization: Optional[str] = Header(
        None, description="Bearer token for authentication"
    ),
    stytch_session_jwt: Optional[str] = Cookie(
        None, description="Stytch session JWT from cookie"
    ),
) -> User:
    """
    FastAPI dependency for required authentication.

    Extracts and authenticates a Bearer token from the Authorization header or a session JWT from a cookie.
    If a valid token is found and authenticated, the corresponding user is returned. If no valid token is found,
    an AuthenticationError is raised.

    Args:
        authorization (Optional[str]): The Authorization header value, potentially containing a Bearer token.
        stytch_session_jwt (Optional[str]): The cookie value potentially containing a session JWT.

    Returns:
        User: The authenticated user object.

    Raises:
        HTTPException: If no valid token is found or authentication fails.
    """
    try:
        return auth_service.authenticate_user(authorization, stytch_session_jwt)
    except AuthenticationError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


async def get_optional_user_from_token(
    authorization: Optional[str] = Header(None),
    stytch_session_jwt: Optional[str] = Cookie(None),
) -> Optional[User]:
    """
    FastAPI dependency for optional authentication.

    Extracts and authenticates a Bearer token from the Authorization header or a session JWT from a cookie.
    If a valid token is found and authenticated, the corresponding user is returned. If no valid token is found,
    None is returned.

    Args:
        authorization (Optional[str]): The Authorization header value, potentially containing a Bearer token.
        stytch_session_jwt (Optional[str]): The cookie value potentially containing a session JWT.

    Returns:
        Optional[User]: The authenticated user object, or None if authentication fails or no token is found.
    """
    try:
        return auth_service.authenticate_user(authorization, stytch_session_jwt)
    except AuthenticationError as e:
        if e.status_code == 401:
            logger.info(f"Optional authentication failed: {e.message}")
            return None
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        logger.error(f"Unexpected error during optional authentication: {e}")
        return None


class AuthManager:
    def __init__(self):
        """
        Initializes the AuthManager with dependencies for authentication.

        Sets up instances of TokenExtractor and AuthService for authentication operations.
        """
        self.required = get_current_user_from_token
        self.optional = get_optional_user_from_token
        logger.info("AUTH MANAGER INITIALIZED")


manager = AuthManager()
