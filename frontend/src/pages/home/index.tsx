import React from "react";
import withAuth from "@/hoc/withAuth";
import { TrendingSearchCarousel } from "@/components/home/TrendingSearchCarousel";
import { ProjectsCarousel } from "@/components/home/ProjectsCarousel";
import { useUser } from "@/context/UserContext";
import SearchHistoryBlock from "@/components/home/SearchHistoryBlock";
import FindBucketsBlock from "@/components/home/FindBucketsBlock";
import Link from "next/link";

function Index() {
  const { user } = useUser();
  return (
    <div className="w-full flex flex-col gap-12 lg:gap-20 p-6 py-16 min-h-screen">
      <div className="flex flex-col gap-4 text-center">
        <h1 className="scroll-m-20 text-2xl font-extrabold tracking-tight lg:text-3xl">
          Welcome{user ? `, ${user.full_name.split(" ")[0]}!` : " to Spydr!"}
        </h1>
      </div>
      <div className="w-11/12 mx-auto my-0 flex flex-col gap-20 overflow-x-hidden">
        <div className="flex flex-col gap-4">
          <div className="w-full flex justify-between items-center">
            <small className="text-sm font-medium leading-noneflex inline items-center ml-2">
              Explore
            </small>
            <Link
              href="/explore"
              className="inline p-0 underline text-blue-800 hover:text-slate-700 mr-2"
            >
              <small>See more</small>
            </Link>
          </div>
          <TrendingSearchCarousel />
        </div>
        <div className="flex flex-col gap-4">
          <div className="w-full flex justify-between items-center">
            <small className="text-sm font-medium leading-noneflex inline items-center ml-2">
              Your buckets
            </small>
            <Link
              href="/buckets"
              className="inline p-0 underline text-blue-800 hover:text-slate-700 mr-2"
            >
              <small>View all</small>
            </Link>
          </div>
          <ProjectsCarousel />
        </div>
        <div className="flex flex-row gap-4">
          <div className="w-full flex flex-col gap-4">
            <small className="text-sm font-medium leading-none flex inline items-center ml-2">
              Recent Searches
            </small>
            <SearchHistoryBlock />
          </div>
          {/**
           * 
           *           <div className="w-full flex flex-col gap-4">
            <small className="text-sm font-medium leading-none flex inline items-center ml-2">
              Saved Buckets
            </small>
            <FindBucketsBlock />
          </div>
           */}
        </div>
      </div>
    </div>
  );
}

export default withAuth(Index);
