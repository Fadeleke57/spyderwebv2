queries = {
    "GET_ALL_ARTICLES" : f'MATCH (n) RETURN n',
    "GET_ARTICLE_BY_ID" : f'MATCH (a:Article {{id: $article_id}}) RETURN a', 
    "GET_ARTICLE_BY_TEXT": """
                           MATCH (a:Article) 
                           WHERE toLower(a.text) CONTAINS toLower($text)
                           OR toLower(a.header) CONTAINS toLower($text)
                           OR toLower(a.author) CONTAINS toLower($text)
                           RETURN a
                           """,
}