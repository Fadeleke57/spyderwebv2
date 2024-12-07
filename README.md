 # Purpose:
 I originally started working on spydr after a disappointing realization that I would not be able to take BU's data structures and algorithms course before junior year internships. However, I did not let that stop me from interacting and exploring the applications of graphs and the algorithms that power them. I started by simply realizing that the structure of any article on a website like Time Magazine, New York Times, or Wired represented a graph. Take any arbitrary article as the root node. The embedded links (references) to other in-house articles (usually referencing another article that gives context to a point in the parent article) represent neighbors of the source article, and so on. After setting up a project where I initialized crawlers for a set of start links, and then computed similarity scores to their child links, I realized I was simulating a naive form of web indexing. This realization sparked my interest in content and search and how I could improve on the current paradigm.<br><br>
Spydr is an ongoing project that allows users to create a mind map of their research, whether that be anything they've gathered on the internet or just some shower thoughts that came by. While there are tools such as Obsidian, Notion, etc., nothing integrates a social, collaborative aspect to building ideas or new knowledge.<br><br> Somewhere where you don't have to reinvent the wheel while gathering data and have some of the world's smartest people as inspiration for your thoughts. <br></br> I'm extremely inspired by Tiago Forte's notion of a <a href="https://www.buildingasecondbrain.com/">second brain</a> and use this application daily to offload the amount of information I encounter every day into pools separated by topics that I can come back and not only reinforce ideas/concepts but build on them too. 
 
 # Spydr is a research platform focused on redefining the search proccess for research, ideas, and reputable information.

 <h2>
  Tech Stack
 </h2>
<h4>Backend:</h4>
   Framework: FastAPI<br>
   Misc. Storage: MongoDB with Pymongo interactions<br>
   Graph Storage: Neo4j, using Cypher to query nodes and relationships<br>
   Embeddings: Pinecone<br><br>
<h4>
 Frontend:
</h4>     
Next.js with Typescript and Tailwind<br><br>

<h4>
 Crawler Proccess (this is going to be adjusted in the latest pivot):
</h4>  
<ul>
 <li>I initialized a Scrapy Spider with connections to a Neo4j driver</li>
 <li>Using the beautiful <a href="https://radimrehurek.com/gensim/">genism library</a>, I created a makeshift TF-IDF model that dynamically computes a similarity score between article nodes in the graph. It was slow at first, so I removed mandatory NLTK tokenization and made it an optional parameter for slightly more accurate results</li>
 <li>The flow looks like: Model instantiated -> parent-child article text is extracted -> corpus about the subject matter is generated to train the model -> article text is transformed into a bag-of-words -> perform a text frequency inverse text frequency between both articles -> similarity score calculated </li>
 <li>Upon a Scrapy crawl with a set of root nodes, children's articles are connected to their parent articles and weighted by this similarity score</li>
 <li>Results are dumped to the Neo4j graph</li>
</ul>

<h2>Features So Far</h2>
Currently supporting: <br>
Semantic Search<br>
Keyword Search<br>
Creating Buckets<br>
Reliability Scoring<br>
Managing Buckets<br>
Curating sources to your argument<br>

<h2>
 Future integrations:
</h2>
Since buckets are essentially a user's mind map/research represented as a knowledge graph, we can place a RAG solution on top of it to garner insights. LightRAG is an optimal solution to the expensive, heavyweight alternative of Microsoft's GraphRAG. Graphs in general provide a more accurate implementation of RAG systems due to the prevalence of contextual knowledge instead of flat document insertion. 
<a href="https://www.youtube.com/watch?v=oageL-1I0GE">See the implementation of lightRAG here</a>
 <br><br>

## Loom Demo

<div>
    <a href="https://www.loom.com/share/c273486dc97946bf98dc5dc464dea95d">
      <p>Unveiling Spider: A Community-Driven Search Engine - Watch Video</p>
    </a>
    <a href="https://www.loom.com/share/c273486dc97946bf98dc5dc464dea95d">
      <img style="max-width:300px;" src="https://cdn.loom.com/sessions/thumbnails/c273486dc97946bf98dc5dc464dea95d-e43e03db9081d26f-full-play.gif">
    </a>
</div>


