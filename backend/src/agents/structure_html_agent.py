import json
from src.lib.openai.index import CLIENT

def process_html(raw_html_content):

    try :
        prompt = (
            "Extract the title or main idea from the following HTML content.\n\n"
            "Usually, the title will be available, but if not, try to extract the main idea.\n\n"
            "This means ignore any other text such as ads that are not part of the title or main idea.\n\n"
            "For the case of discussions like on reddit, try to extract the title of the discussion.\n\n"
            "Return only a concise string of the title or main idea. of the content.\n\n"
            "Try to include the source of the content if possible.\n\n"
            "Return the result in this format:\n\n"
            "{title} - {source}\n\n"
            f"HTML Content:\n{raw_html_content}"
        )
        
        response = CLIENT.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an AI that extracts titles or main ideas from HTML content."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=50 
        )
        
        content = response.choices[0].message.content.strip()
        return content
    
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return "Error processing HTML content"