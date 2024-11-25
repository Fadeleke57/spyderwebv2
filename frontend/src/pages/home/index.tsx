import React from "react";
import withAuth from "@/hoc/withAuth";
import { TrendingSearchCarousel } from "@/components/home/TrendingSearchCarousel";
import { ProjectsCarousel } from "@/components/home/ProjectsCarousel";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Head from "next/head";

function Index() {
  const { user } = useUser();
  return (
    <div className="flex flex-col gap-12 lg:gap-20 p-6 py-16 min-h-screen overflow-x-hidden max-w-[1100px] mx-auto">
      <Head>
        <title>{"home - spydr"}</title>
        <meta name="description" content={"Welcome to spydr"} />
        <meta property="og:title" content={user?.full_name} />
        <meta property="og:description" content={"Welcome to spydr"} />
        <meta
          property="og:url"
          content={`${
            typeof window !== "undefined" ? window.location.href : ""
          }`}
        />
      </Head>
      <h1 className="text-2xl lg:text-4xl font-extrabold tracking-tight">
        Welcome to spydr, {user?.full_name}
      </h1>
      <div>
        <span className="text-lg font-semibold ml-2">Explore</span>
        <TrendingSearchCarousel />
      </div>
      <div>
        <div className="flex flex-col">
          <span className="text-lg font-semibold ml-2">Your Buckets</span>{" "}
          <Link
            href={"/buckets"}
            className="ml-2 text-blue-500 hover:underline"
          >
            View All
          </Link>
        </div>

        <ProjectsCarousel />
      </div>
    </div>
  );
}

export default withAuth(Index);
