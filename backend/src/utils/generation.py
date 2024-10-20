from openai import OpenAI

client = OpenAI()

def generate_queries(claim):
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