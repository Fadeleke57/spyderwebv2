import Image from "next/image";
import BGImage from "@/assets/question.jpg";
import PublicLayout from "@/app/PublicLayout";
import { ReactElement } from "react";

function index() {
  return (
    <div className="min-h-screen flex flex-col lg:pt-10">
      <div style={{ height: "60vh" }} className="w-full relative">
        <Image src={BGImage} alt="bg" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <h1 className="absolute bottom-16 left-8 scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl max-w-2xl text-white">
          The New Way to News: On a Quest to Transform Research
        </h1>
      </div>
      <div className="p-6 lg:px-10 py-0 py-10 flex flex-col gap-6">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          Beyond the Pinacle of AI
        </h2>
        <p>
          Answers AI tools like Perplexity are groundbreaking, offering
          deterministic outputs with cited sources for every sentence. But even
          the best tools have room for growth. Spydr expands on this by asking
          users to look broader. Instead of just getting answers, we invite you
          to explore a comprehensive view of related articles and dive deeper
          into the information behind the answers.
        </p>

        <p>
          As concerns about media bias grow, especially in AI-powered tools,
          Spydr provides a unique solution by visualizing the bias spectrum
          across articles. By allowing users to see multiple perspectives on the
          same topic, Spydr helps reduce implicit biases present in many
          AI-generated outputs. It&#39;s not just about delivering
          answers—it&#39;s about providing context, offering a more balanced,
          informed research experience.
        </p>

        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          Critical and Interactive Research
        </h2>

        <p>
          Spydr is not just another research tool; it&#39;s a platform for
          critical, unbiased, and interactive exploration. By visualizing
          connections between articles, we encourage users to engage deeply with
          the content they read. Whether it&#39;s news or research papers, Spydr
          helps you explore topics beyond surface-level answers, promoting
          intellectual engagement and thorough research.
        </p>

        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
          Features
        </h3>

        <ul className="ml-6 list-disc [&>li]:mt-2">
          <li>
            Bias Visualization: View the bias spectrum across articles to
            explore multiple perspectives on the same topic.
          </li>

          <li>
            Interactive Knowledge Graph: Explore article connections in an
            intuitive, graph-based interface where each article is a node
            connected by relevance.
          </li>

          <li>
            Custom TF-IDF Relevance Model: Weigh relationships between articles
            using a custom-built relevance model based on TF-IDF scoring.
          </li>

          <li>
            Sentiment and Subjectivity Analysis: Analyze articles through
            sentiment and subjectivity metrics using TextBlob for deeper
            insights into tone and bias.
          </li>

          <li>
            Drag-and-Drop Research Buckets: Organize your findings by dragging
            and dropping articles into customizable research buckets for easy
            tracking and comparison.
          </li>

          <li>
            Real-Time and Historic Content: Access up-to-date news articles and
            over 20 years of news and research data.
          </li>

          <li>
            Citation Graph for Research Papers: Visualize relationships between
            research papers, showing “cited by” and referenced links for a
            deeper understanding of academic work.
          </li>

          <li>
            Parent-Child Article Relationships: Follow the chain of articles
            that reference each other, creating a clear path of how ideas and
            facts interconnect.
          </li>

          <li>
            AI-Free Summarization: Promote intellectual engagement by focusing
            on exploration and relevance rather than relying on generalized AI
            summaries.
          </li>
        </ul>

        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          How Spydr Works
        </h2>

        <p>
          Go to any reputable publisher and read their articles. Every article
          often links to other articles for clarity and evidence—just like
          research papers reference other works. Spydr takes this concept and
          visualizes it in an interactive graph. Parent articles are connected
          to their referenced children articles, forming a network of knowledge
          that&#39;s easy to explore. For research papers, Spydr generates a
          similar graph using “cited by” relationships. Our relevance scoring
          system adds even more value by showing how closely connected these
          articles are based on sentiment, subjectivity, and content.
        </p>

        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
          An Interactive Knowledge Graph
        </h3>

        <p>
          Knowledge graphs are powerful, but Spydr brings them to users in a way
          that has never been done before—allowing for true interaction and
          traversal of information. The relevance scoring between articles,
          along with sentiment and subjectivity analysis, ensures you can
          navigate through articles with purpose, making it easier to find the
          most relevant content to your research.
        </p>

        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          Revolutionizing Research: Our Mission
        </h2>

        <p>
          At Spydr, we believe in empowering users to rediscover the value of
          true research. In a world dominated by AI-generated summaries and
          information overload, Spydr offers an alternative that helps you
          engage deeply with content. By visualizing article connections,
          relevance, and bias, we bring back thoughtful exploration and promote
          unbiased research. We are committed to supporting both users and
          publishers, revolutionizing how information is consumed in the digital
          age.
        </p>
      </div>
    </div>
  );
}

index.getLayout = (page: ReactElement) => {
  return <PublicLayout>{page}</PublicLayout>;
};

export default index;
