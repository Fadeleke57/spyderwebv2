import json
from src.lib.openai.index import CLIENT

def process_html(raw_html_content):
    prompt = (
        "You are given the raw HTML output of a webpage. From this HTML, please parse and return a JSON structure containing the following fields:\n\n"
        "1. **Title**: The main title or header for the webpage. Make one if you can't find one.\n"
        "2. **Authors**: The name(s) of the author(s) of the webpage or null if not available.\n"
        "3. **Date**: The publication date of the webpage, if available or null if not.\n"
        "4. **Source**: The name of the source or webpage (e.g., 'New York Times', 'Reddit').\n"
        "5. **Summary**: A concise summary of the webpage's content.\n\n"
        "Return only the JSON output. If a specific field cannot be found, set it to `null`.\n\n"
        "Example format:\n"
        "{\n"
        '  "title": "Example Article Title",\n'
        '  "authors": ["Author Name"],\n'
        '  "date": "2024-11-11",\n'
        '  "source": "Example Source",\n'
        '  "summary": "A brief summary of the article content."\n'
        "}\n\n"
        "Here's the raw HTML content:\n"
        f"{raw_html_content}"
    )
    
    response = CLIENT.chat.completions.create(
        model="gpt-4",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are an AI assistant specialized in extracting structured information from HTML content."
                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        max_tokens=3064
    )
    
    content = response.choices[0].message.content

    try:
        structured_data = json.loads(content)
    except ValueError:
        structured_data = {"error": "Failed to parse JSON from response"}
    print("Structured Data: ", structured_data)
    return structured_data