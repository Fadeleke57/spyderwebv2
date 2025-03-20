from src.lib.openai.index import client as openaiClient
from src.lib.logger.index import logger


def process_md(
    md: str,
):  # TODO: TURN THIS INTO A SUMMARY AGENT THAT RETURNS A TWO SENTENCE SUMMARY OF THE TEXT

    try:
        prompt = (
            "Extract the title or main idea from the following md content.\n\n"
            "Usually, the title will be available, but if not, try to extract the main idea.\n\n"
            "This means ignore any other text such as ads that are not part of the title or main idea.\n\n"
            "For the case of discussions like on reddit, try to extract the title of the discussion.\n\n"
            "Return only a concise string of the title or main idea. of the content.\n\n"
            "Try to include the source of the content if possible.\n\n"
            "If the title, main content, or source is not clear or not enough data is provided, return 'Unititled Source'.\n\n"
            "Otherwise return the result in this format:\n\n"
            "{title} - {source}\n\n"
            f"HTML Content:\n{md}"
        )

        response = openaiClient.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are an AI that extracts titles or main ideas from HTML content.",
                },
                {"role": "user", "content": prompt},
            ],
            max_tokens=50,
        )

        content = response.choices[0].message.content.strip()
        return content

    except Exception as e:
        logger.error(f"An error occurred: {str(e)}")
        return "Untitled Source"
