from src.lib.logger.index import logger
from src.models.web import CreateWeb, Webs
from src.core.config import settings
from tavily import TavilyClient
from src.service.source import service as source_service
from src.db.neo4j import client as neo4j_client
from datetime import datetime
from pytz import UTC
from uuid import uuid4
from src.service.web import service as web_service
from firecrawl import FirecrawlApp
from src.lib.pinecone.index import client as pinecone_client


tavily_client = TavilyClient(api_key=settings.tavily_api_key)
firecrawl_client = FirecrawlApp(api_key=settings.firecrawl_api_key)


def deep_research_service(
    web_id: str,
    create_web_payload: CreateWeb,
    user_id: str,
):
    """
    Performs deep research for a given web.

    Args:
        web_id (str): The ID of the web to perform research for.
        create_web_payload (CreateWeb): The payload used to create the web.
        user_id (str): The ID of the user who created the web.
    """
    logger.info(f"Starting deep research for web_id: {web_id}")
    Webs.update_one({"webId": web_id}, {"$set": {"statusMessage": "Starting deep research..."}})

    try:
        query = create_web_payload.name
        logger.info(f"Research query: {query}")
        Webs.update_one({"webId": web_id}, {"$set": {"statusMessage": "Searching for sources..."}})

        response = tavily_client.search(query=query, search_depth="advanced", max_results=8)
        sources = response["results"]
        source_urls = [source["url"] for source in sources]
        logger.info(f"Found {len(source_urls)} sources: {source_urls}")

        now = datetime.now(UTC).isoformat().replace("+00:00", "Z")
        new_source_ids = []
        total_sources = len(source_urls)

        for i, url in enumerate(source_urls):
            source_id = str(uuid4())
            new_source_ids.append(source_id)
            
            Webs.update_one(
                {"webId": web_id},
                {"$set": {"statusMessage": f"Processing source {i+1} of {total_sources}: {url}"}}
            )

            source_to_insert = {
                "sourceId": source_id,
                "webId": web_id,
                "userId": user_id,
                "name": url,
                "content": "",
                "url": url,
                "type": "website",
                "size": 0,
                "created": now,
                "updated": now,
            }
            neo4j_client.create_node("source", source_to_insert)
            
            # Scrape the website
            scraped_data = firecrawl_client.scrape_url(url)
            markdown = scraped_data.markdown
            metadata = scraped_data.metadata

            if markdown:
                # Embed and upsert the content
                chunks = pinecone_client.chunk_clean_text(markdown)
                pinecone_client.embed_and_upsert_to_pinecone(
                    source=source_to_insert, chunks=chunks
                )
                
                # Update the source in Neo4j with the content and metadata
                source_update_payload = {
                    "content": markdown,
                    "name": metadata.get("title", url),
                    "size": len(markdown.encode('utf-8')),
                    "updated": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
                }
                neo4j_client.update_nodes_by_properties(
                    "source", {"sourceId": source_id}, source_update_payload
                )

        Webs.update_one(
            {"webId": web_id}, {"$push": {"sourceIds": {"$each": new_source_ids}}}
        )

        logger.info(f"Added {len(sources)} sources to web {web_id}")

        Webs.update_one({"webId": web_id}, {"$set": {"statusMessage": "Embedding web..."}})
        web_document = Webs.find_one({"webId": web_id})
        if web_document:
            web_service.emebd_and_upsert_web(web_document)

        Webs.update_one({"webId": web_id}, {"$set": {"status": "completed", "statusMessage": "Completed"}})
        logger.info(f"Deep research completed for web_id: {web_id}")

    except Exception as e:
        logger.error(f"Error during deep research for web_id {web_id}: {e}")
        Webs.update_one({"webId": web_id}, {"$set": {"status": "failed", "statusMessage": "Error during research"}}) 