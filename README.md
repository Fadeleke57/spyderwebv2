 # spyderwebv2
-Backend: FastAPI with Mongo sotrage and Neo4j to store the weighted graph<br>
-Frontend: Next.js with Typescript and Tailwind

-The crawler directory is where I dump to my neo4j graph via 'scrapy crawl {spider_name}' -a search_term="{search term} -s MAX_DEPTH={farthest layer}".<be>
-By default, items will be scraped using a breadth-first search which makes the most sense <br>
-Eventually, I'll add this to a cronjob to keep me from doing this manually.<br>
-It uses selenium (headless) middleware to parse dynamic web pages, a custom TF-IDF relevance model I made with genism, and an optional nltk parameter for better precision.<br>
-Weights between article nodes are determined by the relevance model.<br>
-Right now, I use the news API to train it on a corpus that pertains to the search topic, but I will probably update this logic later.<br>
-Each article is treated as a node and I use TextBlob to do an e2e analysis on an article including sentiment and subjectivity analysis. I'll probably integrate some sort of summary API or agent as well but I'm trying to avoid having to rely on a GPT or LLM.

-Will host on Ec2

Will make this readme look pretty eventually lol
