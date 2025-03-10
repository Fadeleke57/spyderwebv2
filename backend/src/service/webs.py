from fastapi import APIRouter, Depends, UploadFile, File
from src.routes.auth.oauth2 import manager
from fastapi import APIRouter, Depends, Query
from typing import Optional, Literal
import os
from werkzeug.utils import secure_filename
from pytz import UTC
from src.db.mongodb import get_collection, get_items_by_field
from src.utils.exceptions import check_user
from src.utils.search import run_semantic_search
from src.models.user import User
from src.models.analytics import Search
from datetime import datetime
from backend.src.models.web import WebConfig, UpdateWeb, IterateWeb
from fastapi.exceptions import HTTPException
from botocore.exceptions import ClientError
from src.lib.logger.index import logger
from pymongo import ReturnDocument
from src.core.config import settings
import boto3
from src.lib.pinecone.index import PCINDEX, PC, generate_web_embeddings


class WebService:
    def __init__(self):
        pass

    def create_web():
        pass

    def update_web():
        pass

    def iterate_web():
        pass

    def search_webs():
        pass

    def get_web_images():
        pass

    def delete_web():
        pass

    def get_web():
        pass

    def get_public_webs():
        pass
