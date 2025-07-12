from src.routes.auth.index import router as auth_router
from src.routes.user.index import router as user_router
from src.routes.webs.index import router as webs_router
from src.routes.sources.index import router as sources_router
from src.routes.connections.index import router as connections_router
from src.routes.chat.index import router as chat_router
from src.routes.process.index import router as process_router
from src.routes.payment.index import router as payment_router
from src.routes.feedback.index import router as feedback_router
from src.routes.contributor.index import router as contributor_router
from src.routes.feeds.index import router as feeds_router

__all__ = [
    auth_router,
    user_router,
    webs_router,
    sources_router,
    connections_router,
    chat_router,
    process_router,
    payment_router,
    feedback_router,
    contributor_router,
    feeds_router,
]
