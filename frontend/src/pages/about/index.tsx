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
          Spydr: Build on Ideas, Don&apos;t Reinvent the Wheel
        </h1>
      </div>
      <div className="p-6 lg:px-10 py-0 py-10 flex flex-col gap-6">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          <span className="text-blue-500">The Problem:</span> Learning vs. Supporting
        </h2>
        <p>
          When people search online, their intent often falls into two
          categories:
        </p>
        <ul className="ml-6 list-disc [&>li]:mt-2">
          <li>
            <strong>To Learn</strong> - Seeking new knowledge or information
            (e.g., “What is quantum computing?”).
          </li>
          <li>
            <strong>To Support</strong> - Looking for evidence to validate a
            belief or decision (e.g., “Are electric cars better for the
            environment?”).
          </li>
        </ul>
        <p>
          While search engines do a good job of answering “what” and “how,” they
          struggle with helping users gather and organize reliable evidence 
           for more complex arguments. Current platforms like Reddit can offer
          insights, but they&apos;re cluttered with biases. Other AI tools, like
          ChatGPT and Perplexity.ai, struggle with hallucinations and miss the nuances of
          recent news and evolving arguments.
        </p>

        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          <span className="text-blue-500">Our Solution:</span> Spydr, Re-search without the
          <span className="text-blue-500"> &ldquo;Re&rdquo;</span>
        </h2>

        <p>
          Spydr is a research platform that makes it quick and easy to
           collect, organize, and analyze sources. Just input a claim, and
          Spydr provides a mapped-out argument—showing not just the sources
          that back it, but also the weak points, potential counterarguments,
          and the bias spectrum of your topic.
        </p>

        <p>
          With Spydr, you don&apos;t have to reinvent the wheel every time you
          research. Iterate on claims, expand on arguments, and build on
          top of reliable sources. Whether it&apos;s a political issue,
          business validation, academic research, or everyday questions, Spydr
          brings you the information that already exists—without summaries or
          shortcuts.
        </p>

        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
          Key Features
        </h3>

        <ul className="ml-6 list-disc [&>li]:mt-2">
          <li>
            Publish and Explore Research Buckets: Organize your
            findings and publish them for others to explore and build upon.
          </li>
          <li>
            Interactive Knowledge Graph: Follow how ideas and
            sources connect across topics in an easy-to-navigate graph.
          </li>
          <li>
            Bias Visualization: See multiple perspectives and
            understand where they fall on the bias spectrum.
          </li>
          <li>
            Real-Time Content: Stay up-to-date with live
            articles, while also accessing archived content for historical
            research.
          </li>
        </ul>

        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          How Spydr Works
        </h2>

        <p>
          Spydr makes research collaborative. Instead of working in isolation,
          you can reuse and expand on the work of others. Every bucket
          becomes a building block for new ideas, with all sources mapped in a
          graph interface for easy exploration.
        </p>
        <p>
          In these buckets, parent articles connect to their references, showing how knowledge
          evolves through time. No AI summaries—just the facts, connections,
          and context you need to draw your own conclusions.
        </p>

        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          Revolutionizing Research : The Mission
        </h2>

        <p>
          At Spydr, we believe in empowering users to make informed
          decisions through thoughtful research. We are committed to
          supporting meaningful engagement with information by providing tools
          that allow users to explore and build on ideas effortlessly. Our
          mission is to transform research from a task into a powerful
          experience for everyone. Spydr isn&apos;t just about finding answers—it&apos;s
          about helping you explore and build on knowledge. The goal is to highlight
           collaboration and transparency, creating a space where everyone
          can contribute to the conversation, whether by publishing their own research
          buckets or building on existing arguments. Together, we make
          research a dynamic, evolving experience for <strong>anyone.</strong>
        </p>
      </div>
    </div>
  );
}

index.getLayout = (page: ReactElement) => {
  return <PublicLayout>{page}</PublicLayout>;
};

export default index;
