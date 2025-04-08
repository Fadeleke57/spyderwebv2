from openai import OpenAI
from src.core.config import settings
from src.lib.logger.index import logger
from src.models.index import Webs, Web, Users, User


class OpenAIClient:
    def __init__(self):
        logger.info("OPENAI CLIENT INITIALIZED")
        self.client = OpenAI(api_key=settings.openai_api_key)
        self.selected_model = "gpt-4o"
        self.system_prompt = {
            "role": "system",
            "content": f"""
                You are a helpful assistant with access to tools and a graph of information created by the user. 
                Check your knowledge base before answering any questions. 
                Only respond to questions using information from tool calls.
                If the question is something like a personal preference, it will most liekly be located in the graph.
                If no relevant information is found in the tool calls, respond, 'Sorry, I don't know.'
                """,
        }
        self.webId = None

    def configure(self, webId: str, selected_model: str = "gpt-4o"):
        self.selected_model = selected_model
        web: Web = Webs.find_one({"webId": webId})

        if not web:
            raise ValueError("Web not found!")
        webOwner: User = Users.find_one({"id": web["userId"]})

        if not webOwner:
            raise ValueError("Web owner not found!")

        web_name, web_description, web_owner_name = (
            web["name"],
            web["description"],
            webOwner["username"],
        )
        web_context = f"Web ID: {webId}\n Graph title: {web_name}\n Graph description: {web_description}\n Graph owner: {web_owner_name}\n"
        self.system_prompt = {
            "role": "system",
            "content": f"""
                You are a helpful assistant with access to tools and a knowledge graph of information important to the user who created the graph.
                For more context on the graph, here are some details: \n {web_context} 
                When using conect from the graph, please do not mention specific identifiers or unnatural phrases.
                Use the metadata to refer to the context in a natural way (i.e use youtube video title with timestamps or document name with page number, etc).
                If the query can be answered with general knowledge, simply answer the query.
                If not, look for a tool call or multiple tool calls that can answer the query.
                If the query cannot be answered with general knowledge or the provided tools, respond, 'Sorry, that is out of my scope of knowledge.'
                """,
        }
        self.webId = webId

    def _reset(self):
        self.selected_model = "gpt-4o"
        self.system_prompt = {
            "role": "system",
            "content": f"""
                You are a helpful assistant with access to tools and a graph of information created by the user. 
                Check your knowledge base before answering any questions. 
                Only respond to questions using information from tool calls.
                If the question is something like a personal preference, it will most liekly be located in the graph.
                If no relevant information is found in the tool calls, respond, 'Sorry, I don't know.'
                """,
        }
        self.webId = None


client = OpenAIClient()
