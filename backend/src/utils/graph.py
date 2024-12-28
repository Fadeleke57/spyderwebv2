import nltk
import os
from src.lib.pinecone.index import PC, PCINDEX, get_embedding
#from src.db.neo4j import driver as Neo4jDriver, run_query
current_dir = os.path.dirname(__file__)
nltk_data_path = os.path.join(current_dir, '..', 'nltk_data')
nltk.data.path.append(os.path.abspath(nltk_data_path))
from typing import List
from nltk.tokenize import sent_tokenize
from neo4j import Record
from src.utils.queries import queries
from typing import Optional

def split_into_sentences_nltk(text):
    return sent_tokenize(text)

def highlight_match(match): #for frontend highlight
    return f'<span class="font-bold text-blue-400">{match.group(0)}</span>'

"""
def run_keyword_search(query: str, topic: str, limit: int):
    query_clauses = []
    params = {'limit': limit}

    if query:
        query_clauses.append("
            (toLower(a.text) CONTAINS toLower($text) 
            OR toLower(a.header) CONTAINS toLower($text) 
            OR toLower(a.author) CONTAINS toLower($text))
        ")
        params['text'] = query

    if topic and topic != "None":
        query_clauses.append("any(t IN a.topics WHERE toLower(t) = toLower($topic))")
        params['topic'] = topic.lower()

    where_clause = " AND ".join(query_clauses)
    full_where_clause = f"WHERE {where_clause}" if where_clause else ""
    
    cypher_query = f"
        MATCH (a:Article)
        {full_where_clause}
        RETURN a
        LIMIT $limit
    "
    return run_query(cypher_query, params)
"""

### execute semantic search
def run_semantic_search(query: str,limit: int):
    query_embedding = get_embedding(query)
    pinecone_response = PCINDEX.query(vector=query_embedding, top_k=limit, include_metadata=True)
    results = []
    for match in pinecone_response['matches']:
        result = match['metadata']
        result['id'] = match['id']
        results.append(result)
    return results

### execute an exact match search for article ids in neo4j
"""
def get_articles_by_ids(ids: List[str]) -> List[Record]:
    query = "
    MATCH (a:Article)
    WHERE a.id IN $article_ids
    RETURN a
    "
    articles = run_query(query, {'article_ids': ids})
    return articles

def get_article_by_id(id: str) -> Optional[Record]:
    result = run_query(queries["GET_ARTICLE_BY_ID"], {'article_id': id})
    if not result:
        return None
    return result
"""