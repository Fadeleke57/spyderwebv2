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

    def create_article_node(self, article_id, header, author, date_published, link, text, sentiment, subjectivity):
        with self.driver.session() as session:
            session.run(
                "MERGE (a:Article {id: $article_id}) "
                "ON CREATE SET a.header = $header, a.author = $author, a.date_published = $date_published, a.link = $link, a.text = $text, a.sentiment = $sentiment, a.subjectivity = $subjectivity",
                article_id=article_id, header=header, author=author, date_published=date_published, link=link, text=text, sentiment=sentiment, subjectivity=subjectivity)

    def create_relationship_with_score(self, from_id, to_id, score):
        with self.driver.session() as session:
            session.run(
                "MATCH (a:Article {id: $from_id}), (b:Article {id: $to_id}) "
                "MERGE (a)-[:REFERENCES {score: $score}]->(b)",
                from_id=from_id, to_id=to_id, score=score)

class TimeSpider(scrapy.Spider):
    name = "time_with_topics"
    article_ids = {}

    def __init__(self, *args, **kwargs):
        super(TimeSpider, self).__init__(*args, **kwargs)
        URI = os.getenv("NEO4J_URI")
        USERNAME = os.getenv("NEO4J_USER")
        PASSWORD = os.getenv("NEO4J_PASSWORD")
        self.conn = Neo4jConnection(uri=URI, user=USERNAME, password=PASSWORD)

    def start_requests(self):
        topics = ['politics', 'business', 'entertainment', 'climate', 'science', 'sports', 'world', 'tech', 'health']
        for topic in topics:
            url = f'https://time.com/section/{topic}/'
            central_corpus = build_central_corpus(topic, output_dir="../data") # needs to be changed depending on where "scrapy crawl time" is run
            self.relevance_model = RelevanceModel(corpus=central_corpus, use_nltk=True)
            yield SeleniumRequest(url=url, callback=self.parse_page_results)

    def parse_page_results(self, response):
        if response.status != 200:
            self.logger.error(f"Failed to retrieve search results: {response.url} with status {response.status}")
            return

        articles = response.css('div.taxonomy-tout').getall()
        if not articles:
            self.logger.warning(f"No articles found on search results page: {response.url}")

        for article in articles:
            baseUrl='https://time.com'
            article_link = article.css('a::attr(href)').get()
            if article_link:
                full_link = baseUrl + article_link
                yield SeleniumRequest(url=full_link, callback=self.parse_article)

    def parse_article(self, response):
        if response.status != 200:
            self.logger.error(f"Failed to retrieve article: {response.url} with status {response.status}")
            return

        header = response.css('h1::text').get()
        link_to_article = response.url
        parent_id = response.meta.get('parent_id', None)

        dates = response.css('time::text').getall()
        date = " | ".join(dates)
        if not date:
            date = response.css('span.entry-date::text').get()  # accounting for different Time website formats

        author = response.css('a[href*="/author/"]::text').get()

        paragraphs = response.css('p').xpath('string(.)').getall()
        full_text = " ".join(paragraphs)

        article_blob = TextBlob(full_text)
        article_polarity, article_subjectivity = article_blob.sentiment
        
        topics = response.css('header ul li a::text').getall()

        nested_links = response.css('p a::attr(href)').getall()  # nested links are <a> tags within <p> tags
        nested_links = [response.urljoin(url) for url in nested_links]

        article_id = link_to_article.split("/")[4]
        self.conn.create_article_node(article_id, header, author, date, link_to_article, full_text, article_polarity, article_subjectivity)

        if parent_id:
            parent_article = self.conn.get_article_by_id(parent_id)
            relevance_score = self.relevance_model.get_relevance_score(full_text, parent_article['text'])
            self.conn.create_relationship_with_score(parent_id, article_id, relevance_score)

        cant_be_scraped = [] #to get a sense of how many links outside of the general time format
        filtered_links = []
        self.logger.info(f"These links could not be scraped: {cant_be_scraped}")

        for link in nested_links:
            if (link.startswith('http://time.com/') or link.startswith('https://time.com/')) and ('/tag/' not in link) and ('/time-person-of' not in link) :
                filtered_links.append(link)
            else:
                cant_be_scraped.append(link)

        yield {
            'type': 'article',
            'header': header,
            'author': author,
            'update_date/publish_date': date,
            'topics': topics,
            'link_to_article': link_to_article,
            'text': full_text,
            'nested_links': filtered_links,
            'sentiment_score': article_polarity,
            'subjectivity_score': article_subjectivity
        }

        for nested_link in filtered_links:
            yield SeleniumRequest(url=nested_link, callback=self.parse_article, meta={'parent_id': article_id})

    def closed(self, reason):
        self.conn.close()
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