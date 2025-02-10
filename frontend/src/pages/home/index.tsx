import React from "react";
import withAuth from "@/hoc/withAuth";
import { TrendingSearchCarousel } from "@/components/home/TrendingSearchCarousel";
import { ProjectsCarousel } from "@/components/home/ProjectsCarousel";
import { useUser } from "@/context/UserContext";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import { Settings } from "lucide-react";
import SpydrAI from "@/components/utility/Assistant";

function Index() {
  const { user } = useUser();
  const router = useRouter();
  const { loginSource } = router.query;

  return (
    <div className="flex flex-col gap-12 lg:gap-20 p-6 py-16 min-h-screen overflow-x-hidden max-w-[920px] mx-auto">
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
      <Settings
        onClick={() => router.push("/settings")}
        className="absolute top-24 right-4 lg:top-8 lg:right-8 cursor-pointer hover:opacity-50"
      />
      <h1 className="text-2xl text-center lg:text-4xl font-extrabold tracking-tight">
        Welcome to Spydr, {user?.username}
      </h1>
      <div>
        <span className="text-lg font-semibold ml-2">Popular</span>
        <TrendingSearchCarousel />
      </div>
      <div>
        <div className="flex flex-col">
          <span className="text-lg font-semibold ml-2">Recent Buckets</span>{" "}
          <Link
            href={"/buckets"}
            className="ml-2 text-blue-500 hover:underline"
          >
            View All
          </Link>
        </div>

        <ProjectsCarousel />
      </div>
      <SpydrAI />
    </div>
  );
}

export default withAuth(Index);
