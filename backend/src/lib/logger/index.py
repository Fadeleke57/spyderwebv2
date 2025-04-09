import logging


logging.basicConfig(
    level=logging.INFO,
    format="[%(levelname)s] %(filename)s:%(funcName)s: %(message)s",
)
logger = logging.getLogger(__name__)
