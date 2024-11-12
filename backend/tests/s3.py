from pytest import fixture
from fastapi.testclient import TestClient

import pytest
from src.lib.s3.index import S3Bucket

@pytest.fixture
def s3_bucket():
    return S3Bucket('spydr-user-content')

def test_upload_file(s3_bucket, tmp_path):
    # temporary file
    test_file = tmp_path / "test.txt"
    test_file.write_text("This is a test file")

    s3_bucket.upload_file(str(test_file), "test.txt")

    objects = s3_bucket.list_objects()
    assert "test.txt" in objects

def test_download_file(s3_bucket, tmp_path):
    # assuming "test.txt" exists in the bucket from the previous test
    download_path = tmp_path / "downloaded.txt"
    s3_bucket.download_file("test.txt", str(download_path))

    assert download_path.exists()
    assert download_path.read_text() == "This is a test file"

def test_list_objects(s3_bucket):
    objects = s3_bucket.list_objects()
    assert isinstance(objects, list)
    assert "test.txt" in objects

def test_delete_object(s3_bucket):
    s3_bucket.delete_object("test.txt")
    objects = s3_bucket.list_objects()
    assert "test.txt" not in objects