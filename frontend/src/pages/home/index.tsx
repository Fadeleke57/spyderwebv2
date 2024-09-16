import React from "react";
import withAuth from "@/hoc/withAuth";
import { TrendingSearchCarousel } from "@/components/home/TrendingSearchCarousel";
import { ProjectsCarousel } from "@/components/home/ProjectsCarousel";
import {
  TrendingUp,
  PaintBucket,
  Clock,
  FileSearch,
  Newspaper,
  LibraryBig,
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/router";
import Link from "next/link";

function Index() {
  const { user } = useUser();

  const router = useRouter();

  return (
    <div className="flex flex-col gap-8 p-10 lg:py-24 lg:px-16 min-h-screen">
      <div className="w-11/12 mx-auto my-0 flex flex-col gap-4">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Welcome{user ? `, ${user.full_name.split(" ")[0]}!` : " to Spydr!"}
        </h1>
      </div>
      <div className="w-11/12 mx-auto my-0 flex flex-col gap-4">
        <small className="text-sm font-medium leading-none pl-2 flex inline items-center">
          <TrendingUp className="mr-2 text-blue-400" />
          Trending
        </small>
        <TrendingSearchCarousel />
      </div>
      <div className="w-11/12 mx-auto my-0 flex flex-col gap-4">
        <small className="text-sm font-medium leading-none pl-2 flex inline items-center">
          <PaintBucket className="mr-2 text-blue-400" />
          Project Buckets
        </small>
        <ProjectsCarousel />
      </div>
      <div className="w-11/12 mx-auto my-0 grid grid-cols-2 gap-4">
        <div className="w-full flex flex-col gap-4 h-full">
          <small className="text-sm font-medium leading-none pl-2 flex inline items-center">
            <Clock className="mr-2 text-blue-400" /> Recent Searches
          </small>
          <div className="p-10 w-full rounded-md flex flex-wrap gap-4 border">
            {Array.from({ length: 20 }).map(
              (
                _,
                index // TODO: replace with user's searches
              ) => (
                <Link key={index} href={"/"}>
                  <p className="bg-muted px-3 py-1 rounded-xl hover:bg-slate-200">
                    search {index}
                  </p>
                </Link>
              )
            )}
          </div>
        </div>
        <div className="flex flex-col gap-4 h-full">
          <small className="text-sm font-medium leading-none pl-2 flex inline items-center">
            <FileSearch className="mr-2 text-blue-400" /> Spydr Web
          </small>
          <div className="bg-muted rounded-md h-full flex-grow grid grid-cols-2 border cursor-pointer">
            <div className="w-full flex flex-col items-center justify-center">
              <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                News
              </h3>
            </div>
            <div className="bg-white flex items-center justify-center">
              <Newspaper size={50} className="text-blue-400" />
            </div>
          </div>
          <div className="bg-muted rounded-md h-full flex-grow grid grid-cols-2 border cursor-pointer">
            <div className="w-full flex flex-col items-center justify-center">
              <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight te-blue-400">
                Research
              </h3>
            </div>
            <div className="bg-white flex items-center justify-center">
              <LibraryBig size={50} className="text-blue-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(Index);
