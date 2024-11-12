from openai import OpenAI

client = OpenAI()

def generate_queries(claim):
    """
    Break down a claim into 4-5 specific, researchable queries.

    Args:
        claim: A string representing the claim to be broken down.

    Returns:
        A list of strings, each representing a query. The queries are
        separated by newlines. If the claim is not comprehensible or clear
        enough or has no relevant information, an empty string is returned.
        If the claim is inappropriate or seeks to incite hatred or violence,
        an empty string is returned.
    """
    prompt = (
        f"Break down the following claim into 4-5 specific, researchable queries. "
        f"This should represent a holistic, encompassing representation of the claim:\n"
        f"Claim: {claim}\n\n"
        "Queries:"
    )
    
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a helpful assistant that breaks down arguments into 4-5 "
                    "specific, researchable queries. This should represent a holistic, "
                    "encompassing representation of the claim. Return only the queries, "
                    "split by newlines. Do not add any additional text. If the claim is "
                    "not comprehensible or clear enough or has no relevant information "
                    ", return an empty string. Also, if the claim is inapropriate, return "
                    " or seeks to incite hatred or violence, return an empty string."
                )
            },
            {
                "role": "user",
                "content": claim
            }
        ],
        max_tokens=1024
    )
    
    content = response.choices[0].message.content

    queries = [query.strip() for query in content.split('\n') if query.strip()]
    return queries