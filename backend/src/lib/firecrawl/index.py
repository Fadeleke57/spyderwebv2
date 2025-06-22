from src.core.config import settings
from firecrawl import FirecrawlApp
from typing import Union
from fastapi import HTTPException


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

    def get_markdown(
        self, url: str, with_metadata: bool = False, just_metadata: bool = False
    ) -> Union[str, tuple[str, dict], dict]:
        try:
            if just_metadata:
                result = self.app.scrape_url(url=url)
                metadata: dict = result.metadata
                return metadata

            result = self.app.scrape_url(url=url, formats=["markdown"])
            if with_metadata:
                markdown: str = result.markdown
                metadata: dict = result.metadata
                return markdown, metadata

            markdown: str = result.markdown
            return markdown
        except Exception as e:
            raise HTTPException(
                status_code=400, detail="This website is not supported."
            )


client = FireCrawlClient()
