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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function ContributorsBlock({ webId, count }: { webId: string; count: number }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    data: contributors,
    isLoading: isContributorsLoading,
    isError: isContributorsError,
  } = useFetchContributers(webId);

  const MAX_VISIBLE_CONTRIBUTORS = 5;

  const num_skeletons =
    count > MAX_VISIBLE_CONTRIBUTORS ? MAX_VISIBLE_CONTRIBUTORS : count;

  if (isContributorsLoading) {
    return (
      <div className="px-4 py-2">
        <h2 className="text-md mb-4">Contributors</h2>
        <div className="flex flex-wrap gap-2">
          {[...Array(num_skeletons)].map((_, i) => (
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

  const hasMoreContributors = contributors.length > MAX_VISIBLE_CONTRIBUTORS;
  const visibleContributors = contributors.slice(0, MAX_VISIBLE_CONTRIBUTORS);

  const renderContributor = (contributor: PublicUser) => (
    <Tooltip key={contributor.id} delayDuration={100}>
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
      <TooltipContent side="bottom" className="p-0">
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
  );

  return (
    <div className="px-4 py-2">
      <div className="flex items-center mb-4">
        <h2 className="text-md font-semibold text-white">Contributors</h2>
        <Badge className="ml-2 w-fit h-fit py-[2px] px-[4px] flex items-center justify-center text-xs">
          {count}
        </Badge>
      </div>

      <TooltipProvider>
        <div className="flex flex-wrap gap-2 mb-4">
          {visibleContributors.map(renderContributor)}

          {hasMoreContributors && (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger>
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted-foreground text-xs text-background cursor-pointer hover:bg-muted-foreground/80 transition-colors">
                  +{contributors.length - MAX_VISIBLE_CONTRIBUTORS}
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    All Contributors ({contributors.length})
                  </DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 mt-4 max-h-80 overflow-y-auto p-2">
                  {contributors.map((contributor: PublicUser) => (
                    <div
                      key={contributor.id}
                      className="flex flex-col items-center text-center"
                    >
                      <div className="relative w-12 h-12 rounded-full overflow-hidden mb-2">
                        <Image
                          src={`https://robohash.org/${contributor.id}?size=300x300`}
                          alt={contributor.username || "Contributor"}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="text-xs font-medium truncate w-full">
                        {contributor.username || "Anonymous"}
                      </span>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </TooltipProvider>
    </div>
  );
}

export default ContributorsBlock;
