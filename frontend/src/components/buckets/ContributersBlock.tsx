import React, { useState } from "react";
import { useFetchContributers } from "@/hooks/buckets";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PublicUser } from "@/types/user";

function ContributorsBlock({ bucketId }: { bucketId: string }) {
  const {
    data: contributors,
    isLoading: isContributorsLoading,
    isError: isContributorsError,
  } = useFetchContributers(bucketId);
  console.log("contributors", contributors);

  if (isContributorsLoading) {
    return (
      <div className="px-4 py-2">
        <h2 className="text-md mb-4">Contributors</h2>
        <div className="flex flex-wrap gap-2">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="w-12 h-12 rounded-full bg-gray-700 animate-pulse"
            />
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
        <div className="ml-2 px-2 py-1 bg-gray-800 rounded-full text-sm text-gray-300">
          {contributors.length}
        </div>
      </div>

      <TooltipProvider>
        <div className="flex flex-wrap gap-2 mb-4">
          {contributors.map((contributor: PublicUser) => (
            <Tooltip key={contributor.id}>
              <TooltipTrigger>
                <div className="relative w-12 h-12 rounded-full overflow-hidden cursor-pointer border-2 border-transparent hover:border-blue-500 transition-all">
                  <Image
                    src={`https://robohash.org/${contributor.id}?size=300x300`}
                    alt={contributor.username || "Contributor"}
                    fill
                    className="object-cover"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="bg-gray-800 border-gray-700 p-0"
              >
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
                    Iterated this bucket
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
