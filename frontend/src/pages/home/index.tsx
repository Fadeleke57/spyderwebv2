import React from "react";
import withAuth from "@/hoc/withAuth";
import { TrendingSearchCarousel } from "@/components/home/TrendingSearchCarousel";
import { ProjectsCarousel } from "@/components/home/ProjectsCarousel";
import { TrendingUp } from "lucide-react";
import { PaintBucket } from "lucide-react";
import { useUser } from "@/context/UserContext";

function Index() {
  const { user } = useUser();
  if (!user) {
    return null;
  }
  return (
    <div className="flex flex-col gap-8 p-10 lg:py-24 lg:px-16">
      <div className="w-11/12 mx-auto my-0 flex flex-col gap-4">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Welcome, {user.full_name.split(" ")[0]}!
        </h1>
        <small className="text-sm font-medium leading-none pl-2 flex inline items-center">
          <TrendingUp className="mr-2" />
          Trending
        </small>
        <TrendingSearchCarousel />
      </div>
      <div className="w-11/12 mx-auto my-0 flex flex-col gap-4">
        <small className="text-sm font-medium leading-none pl-2 flex inline items-center">
          <PaintBucket className="mr-2" />
          Project Buckets
        </small>
        <ProjectsCarousel />
      </div>
      <div className="w-11/12 mx-auto my-0 flex flex-row gap-4">
        <div className="bg-muted p-10 w-full rounded-md">
          <p>hello</p>
        </div>
        <div className="bg-muted p-10 w-full rounded-md">
          <p>hello</p>
        </div>
      </div>
    </div>
  );
}

export default withAuth(Index);
