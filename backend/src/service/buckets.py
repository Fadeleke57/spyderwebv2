from fastapi import APIRouter, Depends, UploadFile, File
from src.routes.auth.oauth2 import manager
from fastapi import APIRouter, Depends, Query
from typing import Optional, Literal
import os
from werkzeug.utils import secure_filename
import uuid
from src.lib.s3.index import S3Bucket
from pytz import UTC
from src.db.mongodb import get_collection, get_items_by_field
from src.utils.exceptions import check_user
from src.utils.search import run_semantic_search
from src.models.user import User
from src.models.analytics import Search
from datetime import datetime
from src.models.bucket import BucketConfig, UpdateBucket, IterateBucket
from fastapi.exceptions import HTTPException
from botocore.exceptions import ClientError
from src.lib.logger.index import logger
from pymongo import ReturnDocument
from src.core.config import settings
import boto3
from src.lib.pinecone.index import PCINDEX, PC, generate_bucket_embeddings


class BucketService:
    def __init__(self):
        pass

    def create_bucket():
        pass

    def update_bucket():
        pass

    def iterate_bucket():
        pass

    def search_buckets():
        pass

    def get_bucket_images():
        pass

    def delete_bucket():
        pass

    def get_bucket():
        pass

    def get_public_buckets():
        pass
