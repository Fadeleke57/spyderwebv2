 # Purpose:
 I started working on Spydr after a disappointing realization that I could not take BU's data structures and algorithms course before my junior year internships. However, I did not let that stop me from interacting and exploring the applications of graphs and the algorithms that power them. I started by observing that most websites' structure, specifically large publishers like Time Magazine, New York Times, or Wired, represented a graph. Take any arbitrary article as the root node. The embedded links, or references, to other articles represent neighbors of the source entity, and so on. After setting up a project where I initialized crawlers for a set of start links, and then computed similarity scores to their child links, it dawned on me that I was simulating a naive form of web indexing. Google's current search standard uses a similar graph-based traversal method coupled with multimodal language models to give users the best answers. This realization sparked my interest in content and search and how I could improve on the current paradigm.<br><br>
Now, Spydr is an ongoing project that allows users to create a mind map of their research, whether that be anything they've gathered on the internet or just some shower thoughts that came by. While there are tools such as Obsidian, Notion, etc., nothing integrates a social, collaborative aspect to building ideas or new knowledge.<br><br> Somewhere where you don't have to reinvent the wheel while gathering data and have some of the world's smartest people as inspiration for your thoughts. <br></br> I'm extremely inspired by Tiago Forte's notion of a <a href="https://www.buildingasecondbrain.com/">second brain</a> and use this application daily to offload the amount of information I encounter every day into pools separated by topics that I can come back and not only reinforce ideas/concepts but build on them too.
 
 # Spydr is a research platform focused on redefining the search process for research, ideas, and reputable information.

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

<h2>Features So Far</h2>
Currently supporting: <br>
Semantic Search<br>
Keyword Search<br>
Creating Buckets<br>
Managing Buckets<br>
Curating sources to your argument<br>

<h2>
 Future integrations:
</h2>
Since buckets are essentially a user's mind map/research represented as a knowledge graph, we can place an RAG solution on top of it to garner insights. LightRAG is an optimal solution to the expensive, heavyweight alternative of Microsoft's GraphRAG. Graphs in general provide a more accurate implementation of RAG systems due to the prevalence of contextual knowledge instead of flat document insertion. 
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


