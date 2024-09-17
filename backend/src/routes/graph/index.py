from fastapi import APIRouter, Depends, HTTPException, Query
from src.db.neo4j import driver as neo4j_driver, run_query
from src.routes.auth.oauth2 import manager
from src.routes.graph.queries import queries
import logging
import re

router = APIRouter()

@router.get("/articles/")
def get_articles(limit: int = 50, query: str = None, topic: str = None, user=Depends(manager)):
    if not user:
        logging.error("Not authorized!")
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    query_clauses = []
    params = {'limit': limit}

    # search query
    if query:
        query_clauses.append("""
            (toLower(a.text) CONTAINS toLower($text) 
            OR toLower(a.header) CONTAINS toLower($text) 
            OR toLower(a.author) CONTAINS toLower($text))
        """)
        params['text'] = query

    # topic filter
    if (topic and topic != "None"):
        query_clauses.append("any(t IN a.topics WHERE toLower(t) = toLower($topic))")
        params['topic'] = topic.lower()

    #final query
    where_clause = " AND ".join(query_clauses)
    full_where_clause = f"WHERE {where_clause}" if where_clause else ""
    cypher_query = f"""
        MATCH (a:Article)
        {full_where_clause}
        RETURN a
        LIMIT $limit
    """
    
    result = run_query(cypher_query, params)

    return {"result": result}

@router.get("/articles/demo/")
def get_articles(limit: int = 50, query: str = None, topic: str = None):
    
    query_clauses = []
    params = {'limit': limit}

    # search query
    if query:
        query_clauses.append("""
            (toLower(a.text) CONTAINS toLower($text) 
            OR toLower(a.header) CONTAINS toLower($text) 
            OR toLower(a.author) CONTAINS toLower($text))
        """)
        params['text'] = query

    # topic filter
    if (topic and topic != "None"):
        query_clauses.append("any(t IN a.topics WHERE toLower(t) = toLower($topic))")
        params['topic'] = topic.lower()

    #final query
    where_clause = " AND ".join(query_clauses)
    full_where_clause = f"WHERE {where_clause}" if where_clause else ""
    cypher_query = f"""
        MATCH (a:Article)
        {full_where_clause}
        RETURN a
        LIMIT $limit
    """
    
    result = run_query(cypher_query, params)

    return {"result": result}

@router.get("/article/{article_id}")
def get_article_by_id(article_id: str, user=Depends(manager)):
    if not user:
        logging.error("Not authorized!")
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    result = run_query(queries["GET_ARTICLE_BY_ID"], {'article_id': article_id})
    return {"result": result}

@router.get("/sentences/")
def get_sentences_by_id(article_id: str, query: str, user=Depends(manager)):
    if not user:
        logging.error("Not authorized!")
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    result = run_query(queries["GET_ARTICLE_BY_ID"], {'article_id': article_id})
    article_text = result[0]['a']['text']
    article_sentences = article_text.split('.')

    if not query:
        return {"result": {'article_id': article_id, 'sentences': [], 'count': 0}}

    query_regex = re.compile(re.escape(query), re.IGNORECASE)

    def highlight_match(match): #for frontend highlight
        return f'<span class="font-bold text-blue-400">{match.group(0)}</span>'

    highlighted_sentences = [
        query_regex.sub(highlight_match, sentence.strip())
        for sentence in article_sentences if query.lower() in sentence.lower()
    ]
    
    count = len(highlighted_sentences)

    return {
        "result": {
            'article_id': article_id,
            'sentences': highlighted_sentences,
            'count': count
        }
    }