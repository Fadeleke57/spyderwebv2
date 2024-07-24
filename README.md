# spyderwebv2
-Backend: FastAPI with Mongo sotrage and Neo4j to store the weighted graph<br>
-Frontend: Next.js with Typescript and Tailwind

-The crawler directory is where I add to my neo4j database via 'scrapy crawl {spider_name}' -a search_term="{search term}".<br>
-Eventually, I'll add this to a cronjob to keep me from having to do this manually.<br>
-It uses a selenium middleware to parse dynamic web pages and a custom TF-IDF relevance model I made with genism and an optional nltk parameter for better precision.<br>
-Weights between article nodes are determined by the relevance model.<br>
-Each article is treated as a node and I uses TextBlob to do a e2e analysis on an article including sentiment and subjectivity analysis.

Will update this readme ofc
