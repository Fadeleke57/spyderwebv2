from src.core.config import settings
from firecrawl import FirecrawlApp
from typing import Any


class FireCrawlClient:
    def __init__(self):
        self.app = FirecrawlApp(settings.firecrawl_api_key)

    def run_scrape(self, url) -> tuple[str, str]:
        """
        Scrape a webpage for structured data and retrieve the title and
        content as markdown.

        Args:
            url (str): The URL of the webpage to scrape.

        Returns:
            tuple[str, str]: A tuple containing the title and content of the
            webpage as markdown.
        """
        r = self.app.scrape_url(url, formats=["markdown"])
        return r.metadata.get("title", None), r.markdown

    def getMarkdown(
        self, url: str, withMetadata: bool = False, justMetadata: bool = False
    ) -> Any:
        if justMetadata:
            result = self.app.scrape_url(url=url)
            return result.metadata

        result = self.app.scrape_url(url=url, formats=["markdown"])
        if withMetadata:
            return result.markdown, result.metadata

        return result.markdown


client = FireCrawlClient()
