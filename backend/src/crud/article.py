from neo4j import Session
from src.schemas.article import Article

def get_articles(db: Session):
    articles = db.execute("MATCH (a:Article) RETURN a").data()
    #check if articles is not None
    return articles