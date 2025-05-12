# server.py
from mcp.server.fastmcp import FastMCP
import os
from pymongo import MongoClient
from pinecone import Pinecone, ServerlessSpec
from neo4j import GraphDatabase
from pytz import UTC
from datetime import datetime
import time

class MongoScriptsClient:
    def __init__(self):
        self.client = MongoClient("")
        self.database = self.client["storage"]
    
    def _get_collection(self, name : str):
        return self.database[name]

mongo_client = MongoScriptsClient()
Users = mongo_client._get_collection("users")
Webs = mongo_client._get_collection("webs")
Embeddings = mongo_client._get_collection("embeddings")
 
class PineconeScriptsClient:
    def __init__(self):
        self.client = Pinecone(api_key="")
        self.index = self.client.Index(name="")
    
    def generate_embeddings(self, name: str, description: str, header_weight: int = 3) -> any:
        weighted_input = (name + ' ') * header_weight + description
        embeddings = self.client.inference.embed(
            model="multilingual-e5-large",
            inputs=[weighted_input],
                parameters={"input_type": "passage", "truncate": "END"}
        )
        return embeddings

pinecone_client = PineconeScriptsClient()

class Neo4jScriptsClient:

    def __init__(self):
        self.driver = GraphDatabase.driver("", auth=("neo4j", ""))

    def close(self):
        self.driver.close()

    def execute_query(self, query, parameters):
        with self.driver.session() as session:
            result = session.run(query, parameters)
            return [record.data() for record in result]

neo4j_client = Neo4jScriptsClient()

# Create an MCP server
mcp = FastMCP("SpydrMCP")

NOTES_FILE =  os.path.join(os.path.dirname(__file__), "notes.txt")

def ensure_file():
    if not os.path.exists(NOTES_FILE):
        with open(NOTES_FILE, "w") as f:
            f.write("")

@mcp.tool()
def add_note(message: str) -> str:
    """
    Add a note to the file.

    Args:
        message (str): The note to add

    Returns:
        str : A confirmation message indicating that the note was added
    """
    ensure_file()
    with open(NOTES_FILE, "a") as f:
        f.write(message + "\n")
    return f"Added note: {message}"

@mcp.tool()    
def get_notes() -> str:
    """
    Get the contents of the notes file.

    Returns:
        str: The contents of the notes file, or a message indicating that no notes were found.
    """
    ensure_file()
    with open(NOTES_FILE, "r") as f:
        content = f.read()
    return content or "No notes found."

@mcp.resource("notes://latest")
def get_latest_note() -> str:
    """
    Get the latest note from the notes file.

    Returns:
        str: The latest note, or "No notes found." if the file is empty.
    """
    ensure_file()
    with open(NOTES_FILE, "r") as f:
        content = f.readlines()
    return content[-1].strip() if content else "No notes found."

@mcp.prompt()
def note_summart_prompt() -> str:
    """
    Generate a summary prompt for the notes.

    Returns:
        str: A prompt string to summarize the notes if they exist,
             otherwise, a message indicating no notes are found.
    """

    ensure_file()
    with open(NOTES_FILE, "r") as f:
        content = f.read()
    if not content:
        return "No notes found."
    
    return f"Summarize the following notes: {content}"
