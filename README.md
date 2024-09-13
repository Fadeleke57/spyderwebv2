 # spyderwebv2
-Backend: FastAPI with Mongo sotrage and Neo4j to store the weighted graph<br>
-Frontend: Next.js with Typescript and Tailwind

-The crawler directory is where I dump to my neo4j graph via 'scrapy crawl {spider_name}' -a search_term="{search term} -s MAX_DEPTH={farthest layer}".<br>
-By default, items will be scraped using a breadth-first search <br>
-Eventually, I'll add this to a cronjob to keep me from doing this manually.<br>
-It uses selenium (headless) middleware to parse dynamic web pages, a custom TF-IDF relevance model I made with genism, and an optional NLTK parameter for better precision. The NLTK option is significantly slower in tokenization so I usually defer it.<br>
-Weights between article nodes are determined by the relevance model.<br>
-Right now, I use the news API to render information about a topic, then train the model instance on a corpus that's fed from the rendered text. To speed up this process, I am caching general corpora (such as politics, sports, etc.) into an S3 bucket and feeding the cached documents directly into the model. <br>
-Each article is treated as a node and I use TextBlob to do an e2e analysis on an article including sentiment and subjectivity analysis. I'll probably integrate some sort of summary API or agent as well but I'm trying to avoid having to rely on a GPT or LLM.

-the backend is hosted in a docker container on ec2 but I'll leave the client on Vercel because of ci/cd compatibility with next.js.

Will make this readme look pretty eventually lol
