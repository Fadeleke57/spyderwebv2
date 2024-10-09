from fastapi import APIRouter, Depends
from src.db.neo4j import driver as Neo4jDriver, run_query
from src.routes.auth.oauth2 import manager
from src.utils.queries import queries
import re
from src.db.mongodb import get_collection, add_search_to_user
from src.utils.graph import split_into_sentences_nltk, highlight_match, run_semantic_search, run_keyword_search
from src.utils.exceptions import check_user
from src.models.article import Article
from src.models.user import User
router = APIRouter()
from datetime import datetime

@router.get("/")
def get_articles(limit: int = 50, query: str = None, topic: str = None, enableSpydrSearch: bool = False, user = Depends(manager, use_cache=False)):
    if user:
        check_user(user)
    if query:
        new_search = {
            "query": query,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        }
        if user:
            add_search_to_user(user['email'], new_search)

        if enableSpydrSearch:
            result = run_keyword_search(query, topic, limit)
        else:
            result = run_semantic_search(query, limit)
    else:
        if topic:
            result = run_keyword_search("", topic, limit)
        else:
            result = run_semantic_search("latest", limit)

    return {"result": result}

@router.get("/sentences")
def get_sentences_by_id(article_id: str, query: str):
    
    result = run_query(queries["GET_ARTICLE_BY_ID"], {'article_id': article_id})
    if not result:
        return {"result": {'article_id': article_id, 'sentences': [], 'count': 0}}
    article_text = result[0]['a']['text']
    article_sentences = split_into_sentences_nltk(article_text)

    if not query:
        return {"result": {'article_id': article_id, 'sentences': [], 'count': 0}}

    query_regex = re.compile(re.escape(query), re.IGNORECASE)

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

@router.get("/demo")
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

@router.get("/:id")
def get_article_by_id(id: str):
    result = run_query(queries["GET_ARTICLE_BY_ID"], {'article_id': id})
    if not result:
        return {"result": []}
    return {"result": result}
