import boto3
from botocore.exceptions import ClientError


class S3Bucket:
    def __init__(self, bucket_name: str):
        """
        Initializes the S3Bucket object.

        Args:
            bucket_name (str): Name of the S3 bucket to interact with.

        Attributes:
            s3 (boto3.resource): A boto3 S3 resource object.
            bucket (boto3.bucket): A boto3 S3 bucket object.
            bucket_name (str): The name of the bucket.
        """

        self.s3 = boto3.resource("s3")
        self.bucket = self.s3.Bucket(bucket_name)
        self.bucket_name = bucket_name

    def upload_file(self, file_path, object_name=None):
        """
        Uploads a file to S3.

        Args:
            file_path (str): Path to the file to upload.
            object_name (str, optional): Name of the object in S3. Defaults to None.

        Raises:
            ClientError: If there's an error uploading the file.
        """
        if object_name is None:
            object_name = file_path.split("/")[-1]
        try:
            self.bucket.upload_file(file_path, object_name)
            print(
                f"File {file_path} uploaded successfully to {self.bucket_name}/{object_name}"
            )
        except ClientError as e:
            print(f"Error uploading file: {e}")

    def download_file(self, object_name, file_path):
        """
        Downloads a file from S3.

        Args:
            object_name (str): Name of the object in S3.
            file_path (str): Path to save the file to.

        Raises:
            ClientError: If there's an error downloading the file.
        """
        try:
            self.bucket.download_file(object_name, file_path)
            print(f"File {object_name} downloaded successfully to {file_path}")
        except ClientError as e:
            print(f"Error downloading file: {e}")

    def list_objects(self, prefix=""):
        """
        Lists all objects in the bucket with the given prefix.

        Args:
            prefix (str, optional): Prefix to filter the results by. Defaults to ''.

        Returns:
            list[str]: List of object names.
        """
        try:
            return [obj.key for obj in self.bucket.objects.filter(Prefix=prefix)]
        except ClientError as e:
            print(f"Error listing objects: {e}")
            return []

    def delete_object(self, object_name):
        """
        Deletes an object from the S3 bucket.

        Args:
            object_name (str): Name of the object in S3.

        Raises:
            ClientError: If there's an error deleting the object.
        """
        try:
            obj = self.bucket.Object(object_name)
            obj.delete()
            print(f"Object {object_name} deleted successfully from {self.bucket_name}")
        except ClientError as e:
            print(f"Error deleting object: {e}")

    def download_file_object(self, key: str, file_object: str):
        """
        Downloads a file from S3.

        Args:
            object_name (str): Name of the object in S3.
            file_path (str): Path to save the file to.

        Raises:
            ClientError: If there's an error downloading the file.
        """
        try:
            self.bucket.download_fileobj(self.bucket_name, key, file_object)
            print(f"File {key} downloaded successfully to {file_object}")
        except ClientError as e:
            print(f"Error downloading file: {e}")
