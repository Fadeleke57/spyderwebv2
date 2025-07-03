import React from "react";
import { useFetchPopularWebs } from "@/hooks/webs";
import { Web } from "@/types/web";
import router from "next/router";
import { formatText } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";
import Link from "next/link";

function PopularWebsCard() {
  const { data: popularWebs } = useFetchPopularWebs(3);
  return (
    <div className="hidden lg:block h-[calc(64vh-68px)] basis-1/2 sticky top-[89px] ">
      <div className="border rounded-xl  overflow-y-auto p-4">
        <div className="rounded-md">
          <h1 className="text-xl font-bold mb-2">Popular</h1>
          <div className="flex flex-col gap-2">
            {popularWebs ? (
              popularWebs.map((web: Web) => (
                <div key={web.webId} className="cursor-pointer">
                  <span className="text-xs text-muted-foreground">
                    {web.likes.length} stars
                  </span>
                  <br />
                  <span
                    onClick={() => router.push(`/web/${web.webId}`)}
                    className="text-sm font-semibold hover:underline"
                  >
                    {formatText(web.name, 90)}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex flex-col gap-4 my-4">
                <Skeleton className="h-6 w-full rounded-xl" />
                <Skeleton className="h-6 w-full rounded-xl" />
                <Skeleton className="h-6 w-full rounded-xl" />
                <Skeleton className="h-6 w-full rounded-xl" />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="py-4 text-[11px] text-muted-foreground flex flex-wrap">
        <Link
          href={"/blog"}
          className="py-[1px] px-4 mb-2 border-r-[2px] border-border hover:underline transition-all duration-300 ease-in-out"
        >
          Blog
        </Link>{" "}
        <Link
          href="/about/terms-of-service"
          className="py-[1px] px-4 mb-2 border-r-[2px] border-border hover:underline transition-all duration-300 ease-in-out"
        >
          Terms of Service
        </Link>
        <Link
          href="/about/privacy-policy"
          className="py-[1px] px-4 mb-2  border-r-[2px] border-border hover:underline transition-all duration-300 ease-in-out"
        >
          Privacy Policy
        </Link>
        <Link
          href="/blog/mission-statement"
          className="py-[1px] px-4 mb-2  border-r-[2px] border-border hover:underline transition-all duration-300 ease-in-out"
        >
          About
        </Link>
        <Link
          href="/help"
          className="py-[1px] px-4 mb-2  border-r-[2px] border-border hover:underline transition-all duration-300 ease-in-out"
        >
          Help
        </Link>{" "}
        <Link
          href="mailto:farouk@spydr.dev"
          className="py-[1px] px-4 mb-2 border-r-[2px] border-border hover:underline transition-all duration-300 ease-in-out"
        >
          Support
        </Link>{" "}
        <Link
          href={`${window.location.origin}/memory`}
          className="py-[1px] px-4 text-neon cursor-pointer pr-0 mb-2 hover:underline transition-all duration-300 ease-in-out"
        >
          Connect
        </Link>{" "}
        <span className="py-[1px] px-4 mb-2">&copy; 2025 Spydr.</span>
      </div>
    </div>
  );
}

export default PopularWebsCard;
