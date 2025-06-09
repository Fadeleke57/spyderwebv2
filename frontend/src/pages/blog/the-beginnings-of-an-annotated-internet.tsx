import PublicLayout from "@/app/PublicLayout";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import React, { ReactElement } from "react";
import BGImage from "@/assets/question.jpg";
import { motion } from "framer-motion";

const AnimatedHeader = () => {
  return (
    <motion.div
      className="max-w-2xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
    >
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-foreground mb-14">
        The Theory of an Annotated Internet
      </h1>
    </motion.div>
  );
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.8, // Start after header animation completes
    },
  },
};

const fadeInItem = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>{"the theory of an annotated internet"}</title>
        <meta
          name="description"
          content={"Exploring the future of collaborative information sharing"}
        />
        <link rel="icon" href="/favicon.ico" />
        <meta
          property="og:title"
          content={"the theory of an annotated internet"}
        />
        <meta
          property="og:description"
          content={"Exploring the future of collaborative information sharing"}
        />
        <meta
          property="og:url"
          content={`${
            typeof window !== "undefined" ? window.location.href : ""
          }`}
        />
      </Head>
      <div className="w-full relative h-[60vh] rounded-3xl">
        <Image src={BGImage} alt="bg" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>
      <div className="-mt-52 lg:-mt-44 px-8 lg:px-0 z-20 max-w-4xl mx-auto py-12 flex flex-col gap-8">
        <AnimatedHeader />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-8"
        >
          <motion.h2
            variants={fadeInItem}
            className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0"
          >
            <span className="">The Fundamental Flaw in Information Access</span>
          </motion.h2>

          <motion.p variants={fadeInItem}>
            The internet&#39;s current information landscape is dominated by two
            critical problems:
          </motion.p>

          <motion.ul
            variants={fadeInItem}
            className="ml-6 list-disc [&>li]:mt-2"
          >
            <li>
              <strong>The Pay-to-Play Problem</strong> - Search results are
              increasingly dominated by advertisements and SEO manipulation,
              where large corporations and content creators game the system to
              serve their interests rather than users&apos; genuine information
              needs.
            </li>
            <li>
              <strong>The AI Feedback Loop Crisis</strong> - While AI-powered
              answer engines offer{" "}
              <Link
                className="underline text-violet-400"
                href="https://www.blindfiveyearold.com/its-goog-enough"
                target="_blank"
              >
                &lsquo;good enough&rsquo;
              </Link>{" "}
              responses, they risk creating a dangerous cycle where users rely
              on AI for answers while AI becomes increasingly dependent on
              diminishing human input, ultimately degrading both user experience
              and information quality.
            </li>
          </motion.ul>

          <motion.p variants={fadeInItem}>
            Modern search has become a cluttered ecosystem where visibility is
            determined by financial interests rather than accuracy or value.
            AI-powered answer engines, such as{" "}
            <Link
              href="https://www.perplexity.ai/"
              className="underline text-violet-400"
              target="_blank"
            >
              Perplexity.ai
            </Link>
            , while innovative, risk devaluing discussion-rich platforms by
            reducing incentives for human contribution. As AI depends entirely
            on human-generated content for training data, this creates a
            feedback loop where users increasingly rely on AI for answers while
            the quality of source material degrades over time.
          </motion.p>

          <motion.h2
            variants={fadeInItem}
            className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0"
          >
            <span className="">
              Envisioning a Collaborative Knowledge Layer
            </span>
          </motion.h2>

          <motion.blockquote
            variants={fadeInItem}
            className="mt-6 border-l-2 pl-6 italic"
          >
            &ldquo;The future of information isn&apos;t just about what we
            search for, but understanding the context and intent behind our need
            to know.&rdquo;
          </motion.blockquote>

          <motion.p variants={fadeInItem}>
            Imagine an internet where finding quality information doesn&apos;t
            require hours of sifting through unreliable content. Picture a web
            where every article, webpage, and resource is enriched by a
            collaborative layer of human insight—tagged, highlighted, and{" "}
            <a
              className="underline text-violet-400"
              href="https://www.productboard.com/blog/how-medium-highlights-feature-changed-publishing/?"
              target="_blank"
            >
              annotated
            </a>{" "}
            by users who share your goal of finding accurate, valuable
            information.
            <br></br>
            <br></br>
            This represents a fundamental shift: transforming the web from a
            collection of isolated content silos into an interconnected
            knowledge network where human intelligence enhances every piece of
            information. AI systems training on internet data would gain not
            only content but also nuanced, human-driven insights. Researchers
            could benefit from the collective wisdom of hundreds of contributors
            who came before them.
          </motion.p>

          <motion.h2
            variants={fadeInItem}
            className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0"
          >
            The Mechanics of Collective Intelligence
          </motion.h2>

          <motion.p variants={fadeInItem}>
            Inspired by collaborative platforms like{" "}
            <Link
              href="https://www.reddit.com/"
              target="_blank"
              className="underline text-violet-400"
            >
              Reddit
            </Link>{" "}
            and Medium&apos;s{" "}
            <Link
              href={
                "https://help.medium.com/hc/en-us/articles/214406358-About-highlights"
              }
              target="_blank"
              className="underline text-violet-400"
            >
              highlight feature
            </Link>
            {", "}
            an annotated internet would make information discovery a
            community-driven process. Whether researching for academic purposes
            or finding the perfect product, users could build upon the work of
            others rather than starting from scratch.
          </motion.p>

          <motion.p variants={fadeInItem}>
            This system would allow users to collect and organize information from
            across the web while benefiting from the insights of others
            exploring similar topics. Through persistent annotation layers,
            every website becomes enriched with community-generated context,
            corrections, and additional perspectives.
          </motion.p>

          <motion.h3
            variants={fadeInItem}
            className="scroll-m-20 text-2xl font-semibold tracking-tight"
          >
            Core Components
          </motion.h3>

          <motion.ul
            variants={fadeInItem}
            className="ml-6 list-disc [&>li]:mt-2"
          >
            <li>
              <strong>Collaborative Knowledge Networks: </strong>{" "}
              Community-driven platforms that allow users to create, share, and
              build upon research collections, turning individual exploration
              into collective intelligence.
            </li>
            <li>
              <strong>Universal Annotation Layer:</strong> Browser-based tools
              that enable users to anonymously highlight, tag, and comment on
              content from any website, with these insights visible to others
              visiting the same pages.
            </li>
          </motion.ul>

          <motion.h2
            variants={fadeInItem}
            className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0"
          >
            Democratizing Information Discovery
          </motion.h2>

          <motion.p variants={fadeInItem}>
            We stand at a crossroads in how humanity interacts with knowledge.
            The future of information will be shaped by one of two paths: either
            dictated by algorithms and clickbait economics, or reclaimed by
            empowered individuals collaborating to build a smarter, more
            trustworthy web. Over the next decade, the question isn&apos;t
            whether we can access data, but whether we can trust it. The goal is
            to create tools that elevate understanding, democratize discovery,
            and build an internet that amplifies human insight rather than
            commodifying it.
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}

Index.getLayout = (page: ReactElement) => {
  return <PublicLayout>{page}</PublicLayout>;
};

export default Index;
