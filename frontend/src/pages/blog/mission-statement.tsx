import PublicLayout from "@/app/PublicLayout";
import Head from "next/head";
import Image from "next/image";
import React, { ReactElement } from "react";
import BGImage from "@/assets/slogobbg.png";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.8,
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
      <div className="px-8 lg:px-0 lg:mt-10 z-20 max-w-4xl mx-auto py-12 flex flex-col gap-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-8"
        >
          <Link
            href="/blog"
            className="flex items-center gap-2 hover:underline group text-violet-400 font-extrabold mb-2"
          >
            <ArrowLeft
              strokeWidth={4}
              className="group-hover:-translate-x-1 transition-all ease-in-out duration-300"
              size={16}
            />
            Back to Blog
          </Link>
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
            We believe that the future of AI lies not just in smarter models,
            but in giving them better access to the right information at the
            right time. Spydr is building a universal context layer that
            connects your knowledge seamlessly across any AI platform or tool
            you use. Instead of constantly uploading documents, copying and
            pasting context, or switching between different knowledge silos,
            we&apos;re creating a world where your structured information
            follows you everywhere. Our mission is to democratize access to
            structured information by making it truly portable and
            interoperable. When context becomes effortless, innovation becomes
            limitless.
          </motion.p>

          <motion.div
            variants={fadeInItem}
            className="border w-full p-4 rounded-md"
          >
            We envision a future where your knowledge works as hard as you do -
            where information flows freely between the tools you love, and where
            no one has to start from scratch because the context they need is
            always within reach.
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
              <strong>Universal Access:</strong> Your information should work
              everywhere, not just in one app
            </li>
            <li>
              <strong>Seamless Integration:</strong> Context should flow
              effortlessly between the tools you use
            </li>
            <li>
              <strong>Open Standards:</strong> Building on protocols that
              connect rather than divide
            </li>
            <li>
              <strong>User Empowerment:</strong> You own your data and decide
              how it&apos;s used
            </li>
          </motion.ul>

          <motion.p variants={fadeInItem}>
            We&apos;re creating the connective tissue that makes all your
            information work together, everywhere you need it.
          </motion.p>

          <motion.p variants={fadeInItem} className="italic mt-4">
            Made with love,
            <br />
            -spydr team
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
