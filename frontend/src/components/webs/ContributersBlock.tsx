import React, { useState } from "react";
import { useFetchContributers } from "@/hooks/webs";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PublicUser } from "@/types/user";
import { Skeleton } from "../ui/skeleton";
import { Badge } from "../ui/badge";

/**
 * A component that displays a list of contributors for a given web ID.
 *
 * It fetches the contributors using the useFetchContributers hook and displays
 * them in a grid. If there is an error or the contributors are loading, it
 * displays a loading or error message.
 *
 * @param {Object} props The properties of the component.
 * @param {string} props.webId The ID of the web to fetch contributors for.
 * @param {number} props.count The number of contributors to display.
 */
function ContributorsBlock({ webId, count }: { webId: string, count: number }) { //count is number of contributors
  const {
    data: contributors,
    isLoading: isContributorsLoading,
    isError: isContributorsError,
  } = useFetchContributers(webId);

  if (isContributorsLoading) {
    return (
      <div className="px-4 py-2">
        <h2 className="text-md mb-4">Contributors</h2>
        <div className="flex flex-wrap gap-2">
          {[...Array(count)].map((_, i) => (
            <Skeleton key={i} className="w-12 h-12 rounded-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isContributorsError || !contributors) {
    return (
      <div className="px-4 py-2 text-red-500">Error loading contributors</div>
    );
  }

  return (
    <div className="px-4 py-2">
      <div className="flex items-center mb-4">
        <h2 className="text-md font-semibold text-white">Contributors</h2>
        <Badge className="ml-2 w-6 h-6 flex items-center justify-center p-2 text-sm">
          {contributors.length}
        </Badge>
      </div>

      <TooltipProvider>
        <div className="flex flex-wrap gap-2 mb-4">
          {contributors.map((contributor: PublicUser) => (
            <Tooltip key={contributor.id}>
              <TooltipTrigger>
                <div className="relative w-10 h-10 rounded-full overflow-hidden cursor-pointer border-2 border-transparent hover:border-blue-500 transition-all">
                  <Image
                    src={`https://robohash.org/${contributor.id}?size=300x300`}
                    alt={contributor.username || "Contributor"}
                    fill
                    className="object-cover"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className=" p-0">
                <div className="p-4 max-w-xs">
                  <div className="flex items-center mb-2">
                    <Image
                      src={`https://robohash.org/${contributor.id}?size=300x300`}
                      alt={contributor.username || "User"}
                      width={32}
                      height={32}
                      className="rounded-full mr-2"
                    />
                    <div>
                      <div className="font-bold text-white">
                        {contributor.username || "Anonymous"}
                      </div>
                      <div className="text-sm text-gray-400">
                        {contributor.full_name}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    Iterated this web
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
}

export default ContributorsBlock;
