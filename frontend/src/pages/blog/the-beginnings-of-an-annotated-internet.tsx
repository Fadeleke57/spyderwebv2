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
        The Beginnings of an Annotated Internet
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
        <title>{"about - spydr"}</title>
        <meta name="description" content={"Learn more about spydr"} />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content={"about - spydr"} />
        <meta property="og:description" content={"Learn more about spydr"} />
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
            <span className="">The Model For Search is Inherently Flawed</span>
          </motion.h2>

          <motion.p variants={fadeInItem}>
            The internet&#39;s current search standard is hindered by two major
            issues:
          </motion.p>

          <motion.ul
            variants={fadeInItem}
            className="ml-6 list-disc [&>li]:mt-2"
          >
            <li>
              <strong>Ads and SEO</strong> - A &ldquo;pay-to-play&rdquo; system
              dominated by large corporations and creators manipulating SEO to
              serve their interests, not users&apos;.
            </li>
            <li>
              <strong>AI Overviews</strong> - While promising, AI often provides{" "}
              <Link
                className="underline text-blue-500"
                href="https://www.blindfiveyearold.com/its-goog-enough"
                target="_blank"
              >
                &lsquo;good enough&rsquo;
              </Link>{" "}
              answers, missing nuances in web data and undermining original
              content creators. This model is unsustainable and risks degrading
              the quality of online information.
            </li>
          </motion.ul>

          <motion.p variants={fadeInItem}>
            Google Search has become a cluttered ecosystem where ads overshadow
            organic results, prioritizing revenue over usability. Similarly,
            AI-powered answer engines, such as{" "}
            <Link
              href="https://www.perplexity.ai/"
              className="underline text-blue-500"
              target="_blank"
            >
              Perplexity.ai
            </Link>
            , while innovative, risk devaluing discussion-promoted sites by
            reducing incentives to contribute to these sources. As AI is only as
            good as the data it&#39;s trained on, this creates a feedback loop
            where users rely on AI for answers, and AI relies on users for data.
            Eventually, this feedback loop degrades both the user experience and
            the AI ecosystem.
          </motion.p>

          <motion.h2
            variants={fadeInItem}
            className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0"
          >
            <span className="">Introducing a New Context Layer</span>
          </motion.h2>

          <motion.blockquote
            variants={fadeInItem}
            className="mt-6 border-l-2 pl-6 italic"
          >
            &ldquo;SEO&rdquo; is about understanding the USER. How do they
            search? And what is the intent behind those searches?<br></br>AJ
            Kohn - Digital Marketer and Start-Up Advisor.
          </motion.blockquote>

          <motion.p variants={fadeInItem}>
            Spydr is pioneering an annotative layer for the internet that shifts
            the focus from &ldquo;what&rdquo; users search for to
            &ldquo;why.&rdquo;
            <br></br>
            <br></br>No more ads. No more SEO manipulation. No more content
            driven by metrics like clicks or backlinks. Imagine an internet
            where looking for information doesn&apos;t mean hours or days of
            useless information. Every website and article is{" "}
            <a
              className="underline text-blue-500"
              href="https://www.productboard.com/blog/how-medium-highlights-feature-changed-publishing/?"
              target="_blank"
            >
              tagged and annotated
            </a>{" "}
            by users just like you, with the same goal as you - finding quality
            answers. Think of it as a comment section for the entire web, with
            limitless applications. AI companies training models on internet
            data would gain not only the content of a webpage but also an
            additional layer of nuanced, human-driven insights as a precursor to
            semantics. Researchers filtering through articles could benefit from
            the collective foresight of hundreds of contributors before them.
          </motion.p>

          <motion.h2
            variants={fadeInItem}
            className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0"
          >
            How Spydr Works
          </motion.h2>

          <motion.p variants={fadeInItem}>
            Inspired by online discussion platform,{" "}
            <Link
              href="https://www.reddit.com/"
              target="_blank"
              className="underline text-blue-500"
            >
              Reddit
            </Link>
            , and Medium&apos;s{" "}
            <Link
              href={
                "https://help.medium.com/hc/en-us/articles/214406358-About-highlights"
              }
              target="_blank"
              className="underline text-blue-500"
            >
              highlight feature
            </Link>
            {", "}
            Spydr plans to make search a community-driven process. Whether that
            be looking for reputable informtion for a research project or just
            looking for your newest sofa. Instead of working in isolation, you
            can reuse and expand on the work of others. Spydr allows you to
            start with a private mind map, called a &apos;web&apos; of what you
            are looking for. As you traverse either Spydr or the web, you can
            collect and add information such as notes, youtube videos,
            documents, and websites to your web. You can then share your web
            with others, and even publish it for others to explore and build
            upon.
          </motion.p>

          <motion.p variants={fadeInItem}>
            Outside of Spydr, through the use of an extension, you can
            anonymously highlight and tag content from any site you visit or add
            it to a web. Other people can then view your highlights and see what
            you were looking for and if you were successful. In Spydr, you can
            also find a published web and use it as a jumping off point for
            whatever you&apos;d like to explore.
          </motion.p>

          <motion.h3
            variants={fadeInItem}
            className="scroll-m-20 text-2xl font-semibold tracking-tight"
          >
            Features
          </motion.h3>

          <motion.ul
            variants={fadeInItem}
            className="ml-6 list-disc [&>li]:mt-2"
          >
            <li>
              <strong>In-House Discussion and Search Platform: </strong> Spydr
              fosters a community-driven approach to search by allowing users to
              create and publish &ldquo;webs,&rdquo; or mind maps, for their
              research or exploration.
            </li>
            <li>
              <strong>External Annotated Web Tool:</strong> With a browser
              extension, users can anonymously highlight, tag, and comment on
              content from any website. Others visiting the same page can view
              these highlights, gaining insights from the contributor&apos;s
              annotations and assessing the quality of the content.
            </li>
          </motion.ul>

          <motion.h2
            variants={fadeInItem}
            className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0"
          >
            Democratizing How Information is Gathered and Shared
          </motion.h2>

          <motion.p variants={fadeInItem}>
            We stand at the brink of redefining how humanity interacts with
            knowledge. The future of information is either dictated by
            algorithms and clickbait or reclaimed by empowered individuals
            collaborating to build a smarter, annotated web. Over the next
            decade, the question isn&apos;t whether we can access data, but
            whether we can trust it. Our mission is to arm people with the tools
            to elevate their understanding, democratize discovery, and create an
            internet that amplifies human insight rather than commodifies it.
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
