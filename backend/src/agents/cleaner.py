from src.lib.openai.index import client as openaiClient
from src.lib.logger.index import logger


class CleanerAgent:
    def __init__(self):
        self.client = openaiClient

    def clean_website_md(self, md: str) -> str:
        """
        Takes the website content and cleans it by removing any ads, navigation, and other non-content, non-important elements.
        """
        try:
            prompt = (
                "Clean the following website content by removing any ads, navigation, and other non-content, non-important elements.\n\n"
                "Return only the cleaned content in markdown format.\n\n"
                f"Website Content:\n{md}"
            )

            response = openaiClient.client.chat.completions.create(
                model=openaiClient.selected_model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an AI that cleans website content by removing any ads, navigation, and other non-content, non-important elements.",
                    },
                    {"role": "user", "content": prompt},
                ],
                max_tokens=10000,
            )

            cleaned_md = response.choices[0].message.content.strip()
            return cleaned_md

        except Exception as e:
            logger.error(f"An error occurred: {str(e)}")
            return md


agent = CleanerAgent()
