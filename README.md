# spyderwebv2
-Backend: FastAPI with Mongo sotrage and Neo4j to store the weighted graph<br>
-Frontend: Next.js with Typescript and Tailwind

-The crawler directory is where I dump to my neo4j graph via 'scrapy crawl {spider_name}' -a search_term="{search term}".<br>
-Eventually, I'll add this to a cronjob to keep me from having to do this manually.<br>
-It uses a selenium (headless) middleware to parse dynamic web pages and a custom TF-IDF relevance model I made with genism and an optional nltk parameter for better precision.<br>
-Weights between article nodes are determined by the relevance model.<br>
-Right now, I use the news api to train it on a corpus that pertains to the search topic, but will probably update this logic later.<br>
-Each article is treated as a node and I use TextBlob to do a e2e analysis on an article including sentiment and subjectivity analysis.

Will make this readme look nice eventually lol
