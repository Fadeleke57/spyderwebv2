from src.core.config import settings
from firecrawl import FirecrawlApp


class FireCrawlClient:
    def __init__(self):
        self.app = FirecrawlApp(settings.firecrawl_api_key)

    def run_scrape(self, url) -> tuple[str, str]:
        r = self.app.scrape_url(url, params={"formats": ["markdown"]})
        return r["metadata"]["title"], r["markdown"]


client = FireCrawlClient()
