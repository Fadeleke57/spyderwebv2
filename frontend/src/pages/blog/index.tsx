import PublicLayout from "@/app/PublicLayout";
import React, { ReactElement } from "react";
import questionMark from "@/assets/question.jpg";
import blackbox from "@/assets/blackbox.webp";
import spydrblacklogo from "@/assets/slogobbg.png";
import Image from "next/image";
import { useRouter } from "next/router";
import Link from "next/link";
import { motion } from "framer-motion";
import Head from "next/head";

const blogPosts = [
  {
    id: 1,
    title: "Unraveling the Modern Web",
    category: "Release",
    readTime: "4 min read",
    image: blackbox,
    url: "/blog/unraveling-the-web",
  },
  {
    id: 2,
    title: "The Beginnings of an Annotated Internet",
    category: "Theory",
    readTime: "3 min read",
    image: questionMark,
    url: "/blog/the-beginnings-of-an-annotated-internet",
  },
  {
    id: 3,
    title: "Our mission statement",
    category: "Writing",
    readTime: "1 min read",
    image: spydrblacklogo,
    url: "/blog/mission-statement",
  },
];

function Index() {
  // Use the first blog post as the featured post
  const featuredPost = blogPosts[0];
  const otherPosts = blogPosts.slice(1);
  const router = useRouter();

  const handleBlogClick = (url: string) => {
    router.push(url);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const headerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const textVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen">
      <Head>
        <title>{"blog - spydr"}</title>
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
      <div className="max-w-7xl mx-auto px-8 sm:px-10 p-16">
        <motion.div
          className="mb-16 lg:my-16 py-0 flex flex-col space-y-4 max-w-xl"
          variants={headerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="text-2xl font-semibold tracking-tight lg:text-4xl"
            variants={textVariants}
          >
            Breaking Down the Barriers between{" "}
            <span className="text-violet-400/80 font-serif">Ideation</span> and{" "}
            <span className="text-violet-400/80 font-serif">Innovation.</span>
          </motion.h1>
          <motion.p variants={textVariants}>
            We&apos;re proud to annouce the launch of our{" "}
            <Link
              href={"/explore"}
              className="hover:underline transition-all duration-300 text-violet-400/80 ease-in"
            >
              <span className="text-violet-400/80">beta!</span>
            </Link>
          </motion.p>
        </motion.div>

        {/* Mobile view - All posts same size in a single column */}
        <motion.div
          className="lg:hidden space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {blogPosts.map((post) => (
            <motion.div
              key={post.id}
              className="group block"
              variants={itemVariants}
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg">
                <Image
                  src={post.image}
                  alt={post.title}
                  className="object-cover"
                />
              </div>
              <div className="mt-4">
                <h2
                  className={`${post.id === 1 ? "text-2xl" : "text-xl"} font-semibold text-foreground`}
                >
                  {post.title}
                </h2>
                <div className="mt-2 flex items-center gap-4">
                  <span className="text-sm text-foreground">
                    {post.category}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {post.readTime}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Desktop view - Featured post with sticky positioning and side panel */}
        <div className="hidden lg:flex flex-row gap-8">
          {/* Main content area - Featured Post */}
          <motion.div
            className="w-2/3"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="relative">
              {/* Large featured image that stays fixed when scrolling */}
              <div className="sticky top-24">
                <div
                  className="relative aspect-[16/9] w-full overflow-hidden rounded-lg cursor-pointer"
                  onClick={() => handleBlogClick(featuredPost.url)}
                >
                  <Image
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="mt-6">
                  <h1 className="text-4xl font-semibold text-foreground">
                    {featuredPost.title}
                  </h1>
                  <div className="mt-4 flex items-center gap-4">
                    <span className="text-foreground">
                      {featuredPost.category}
                    </span>
                    <span className="text-muted-foreground">
                      {featuredPost.readTime}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Side panel - Other posts */}
          <motion.div
            className="w-1/3 space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {otherPosts.map((post) => (
              <motion.div
                key={post.id}
                className="group block cursor-pointer"
                onClick={() => handleBlogClick(post.url)}
                variants={itemVariants}
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <h2 className="text-xl font-semibold text-foreground">
                    {post.title}
                  </h2>
                  <div className="mt-2 flex items-center gap-4">
                    <span className="text-sm text-foreground">
                      {post.category}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {post.readTime}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

Index.getLayout = (page: ReactElement) => {
  return <PublicLayout>{page}</PublicLayout>;
};

export default Index;
