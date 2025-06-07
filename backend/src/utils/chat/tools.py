import requests
from src.lib.pinecone.index import client as pineconeClient
from src.lib.logger.index import logger
from typing import Optional


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
    query: str,
    sources: list[str] = [],
    limit: int = 20,
    webId: Optional[str] = None,
):
    # TODO: Do something cool with neo4j
    filter = {}
    if sources:
        filter = {"sourceId": {"$in": sources}}
    if webId:
        filter["webId"] = webId

    try:
        logger.info(
            f"Fetching graph context with filter: {filter}, and query: {query} and limit: {limit}"
        )
        context = pineconeClient.run_semantic_source_search(
            query=query, filter=filter, limit=limit
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
