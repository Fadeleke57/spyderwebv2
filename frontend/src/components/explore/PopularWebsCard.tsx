import React from "react";
import { useFetchPopularWebs } from "@/hooks/webs";
import { Web } from "@/types/web";
import router from "next/router";
import { formatText } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";

function PopularWebsCard() {
  const { data: popularWebs } = useFetchPopularWebs(3);
  return (
    <div className="hidden lg:flex flex-col basis-1/2 gap-2 border rounded-lg h-[calc(64vh-68px)] overflow-y-auto sticky top-[88px] p-4">
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
            <div className="flex flex-col gap-4">
              <Skeleton className="h-8 w-full rounded-xl" />
              <Skeleton className="h-8 w-full rounded-xl" />
              <Skeleton className="h-8 w-full rounded-xl" />
              <Skeleton className="h-8 w-full rounded-xl" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PopularWebsCard;
