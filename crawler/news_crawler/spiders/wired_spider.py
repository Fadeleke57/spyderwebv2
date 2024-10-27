import scrapy
from scrapy_selenium import SeleniumRequest
from neo4j import GraphDatabase
from textblob import TextBlob
from ..models.relevance_model import RelevanceModel
from ..models.util import build_central_corpus
from dotenv import load_dotenv
import os
load_dotenv()

class Neo4jConnection:
    def __init__(self, uri, user, password):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        self.driver.close()

    def get_article_by_id(self, article_id):
        with self.driver.session() as session:
            result = session.run("MATCH (a:Article {id: $article_id}) RETURN a.id AS id, a.text AS text", article_id=article_id)
            return result.single()

    def create_article_node(self, article_id, header, author, date_published, topics, link, text, sentiment, subjectivity):
        with self.driver.session() as session:
            session.run(
                "MERGE (a:Article {id: $article_id}) "
                "ON CREATE SET a.header = $header, a.author = $author, a.date_published = $date_published, a.topics = $topics, a.link = $link, a.text = $text, a.sentiment = $sentiment, a.subjectivity = $subjectivity",
                article_id=article_id, header=header, author=author, date_published=date_published, topics=topics, link=link, text=text, sentiment=sentiment, subjectivity=subjectivity)

    def create_relationship_with_score(self, from_id, to_id, score):
        with self.driver.session() as session:
            session.run(
                "MATCH (a:Article {id: $from_id}), (b:Article {id: $to_id}) "
                "MERGE (a)-[:REFERENCES {score: $score}]->(b)",
                from_id=from_id, to_id=to_id, score=score)
            
    def clean_graph(self):
        with self.driver.session() as session:
            session.run(
                "MATCH (a:Article) "
                "WHERE a.sentiment = 0 AND a.subjectivity = 0 "
                "DETACH DELETE a"
            )

class WiredSpider(scrapy.Spider):
    name = "time_with_topics"
    article_ids = {}

    def __init__(self, *args, **kwargs):
        super(WiredSpider, self).__init__(*args, **kwargs)
        URI = os.getenv("NEO4J_URI")
        USERNAME = os.getenv("NEO4J_USER")
        PASSWORD = os.getenv("NEO4J_PASSWORD")
        self.conn = Neo4jConnection(uri=URI, user=USERNAME, password=PASSWORD)
#['climate', 'sports', 'health', 'tech', , 'science', 'entertainment', 'sports']
    def start_requests(self):
        with open('rendered_response.html', 'w', encoding='utf-8') as f:
            f.write(response.text)  
            
"""
------------------DEBUGGING UTILITY-----------------------------------------------      

 with open('rendered_response.html', 'w', encoding='utf-8') as f:
    #f.write(response.text)  

-------------------------USEFUL----------------------------------------------------
Speed of css selectors***********************

1. ID, e.g. #header
2. Class, e.g. .promo
3. Type, e.g. div
4. Adjacent sibling, e.g. h2 + p
5. Child, e.g. li > ul
6. Descendant, *e.g. ul a*
7. Universal, i.e. *
8. Attribute, e.g. [type="text"]
9. Pseudo-classes/-elements, e.g. a:hover

delete all nodes query*************

MATCH (n)
DETACH DELETE n

for pages after the first in search results*************

if pagination is needed, uncomment and use below
    for i in range(2, 4):
    next_page_url = f'https://time.com/search/?q={self.search_term}&page={i}'
    yield SeleniumRequest(url=next_page_url, callback=self.parse_search_results, meta={'depth': response.meta['depth']})

TextBlob info*****

>>> testimonial = TextBlob("Textblob is amazingly simple to use. What great fun!")
>>> testimonial.sentiment
Sentiment(polarity=0.39166666666666666, subjectivity=0.4357142857142857)
>>> testimonial.sentiment.polarity
0.39166666666666666

"""