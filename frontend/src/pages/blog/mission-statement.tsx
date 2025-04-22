import PublicLayout from "@/app/PublicLayout";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import React, { ReactElement } from "react";
import BGImage from "@/assets/slogobbg.png";
import { motion } from "framer-motion";

const AnimatedHeader = () => {
  return (
    <motion.div
      className="max-w-2xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
    >
      <h1 className="scroll-m-20 lg:text-4xl font-extrabold tracking-tight lg:text-5xl text-foreground mb-14">
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
        <title>{"mission statement - spydr"}</title>
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
      <div className="px-8 lg:px-0 mt-10 z-20 max-w-4xl mx-auto py-12 flex flex-col gap-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-8"
        >
          <motion.div
            variants={fadeInItem}
            className="rounded-lg overflow-hidden bg-[#131313] border"
          >
            <Image
              src={BGImage}
              alt="bg"
              className="w-full max-h-[200px] object-contain"
            />
          </motion.div>
          <motion.h2
            variants={fadeInItem}
            className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0"
          >
            <span className="">Our mission</span>
          </motion.h2>

          <motion.p variants={fadeInItem}>
            Spydr empowers innovators, researchers, and learners to build upon
            each other&apos;s knowledge by creating an interconnected layer of human
            insight across the digital world. We&apos;re democratizing innovation by
            enabling users to create, connect, and share webs of knowledge
            through semantic linking of diverse content - from documents to
            videos, websites to personal notes. Our mission is to break down the
            barriers between ideation and innovation. In a world where AI is
            removing technical constraints, we believe that the ability to
            discover, iterate, and build upon ideas will become the key
            differentiator. Spydr serves as a GitHub for ideas, creating a
            collaborative ecosystem where the pure form of human thinking and
            ideation can flourish.
          </motion.p>

          <motion.div
            variants={fadeInItem}
            className="border w-full p-4 rounded-md"
          >
            We envision a future in which no one has to start from scratch,
            where knowledge builds upon knowledge, and where humanity&apos;s
            collective intelligence becomes more than the sum of its parts.
          </motion.div>

          <motion.h3
            variants={fadeInItem}
            className="scroll-m-20 text-2xl font-semibold tracking-tight"
          >
            Core Values
          </motion.h3>

          <motion.ul
            variants={fadeInItem}
            className="ml-6 list-disc [&>li]:mt-2"
          >
            <li>
              <strong>Open Collaboration:</strong> Creating a platform where
              ideas can be freely shared and built upon
            </li>
            <li>
              <strong>Knowledge Democracy:</strong> Making innovation and
              learning accessible to everyone
            </li>
            <li>
              <strong>Innovation Through Connection:</strong> Enabling semantic
              and intuitive linking between ideas
            </li>
            <li>
              <strong>Human-Centered Design:</strong> Preserving the nuance and
              context of human thought processes
            </li>
          </motion.ul>

          <motion.p variants={fadeInItem}>
            At Spydr, we&apos;re not just building a tool - we&apos;re creating an
            annotative layer over the Internet ecosystem that transforms how
            people learn, ideate, and innovate together.
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
