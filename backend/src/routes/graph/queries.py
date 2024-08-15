queries = {
    "GET_ALL_ARTICLES" : f'MATCH (n) RETURN n',
    "GET_ARTICLE_BY_ID" : f'MATCH (a:Article {{id: $article_id}}) RETURN a' 
}