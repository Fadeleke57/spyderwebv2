import requests
from src.lib.pinecone.index import client as pineconeClient
from src.lib.logger.index import logger


def get_current_weather(latitude, longitude):
    # Format the URL with proper parameter substitution
    url = f"https://api.open-meteo.com/v1/forecast?latitude={latitude}&longitude={longitude}&current=temperature_2m&hourly=temperature_2m&daily=sunrise,sunset&timezone=auto"

    try:
        # Make the API call
        response = requests.get(url)

        # Raise an exception for bad status codes
        response.raise_for_status()

        # Return the JSON response
        return response.json()

    except requests.RequestException as e:
        # Handle any errors that occur during the request
        print(f"Error fetching weather data: {e}")
        return None


def get_graph_context(
    webId: str, query: str, sources: list[str] = []
):  # TODO: move to agent interface to extract webId, userId, etc.
    filter = {}
    if sources:
        filter = {"sourceId": {"$in": sources}}

    try:
        logger.info(
            f"Fetching graph context for webId: {webId}, with filter: {filter}, and query: {query}"
        )
        context = pineconeClient.run_semantic_source_search(
            webId=webId, query=query, filter=filter, limit=15
        )
        logger.info(f"Graph context: {context}")
        return {"context": context}
    except Exception as e:
        print(f"Error fetching graph context: {e}")
        return None


available_tools = {
    "get_current_weather": get_current_weather,
    "get_graph_context": get_graph_context,
}
