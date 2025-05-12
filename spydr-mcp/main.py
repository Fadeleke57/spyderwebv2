# server.py
from mcp.server.fastmcp import FastMCP
import os

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
