import React, { useState } from "react";
import { useFetchContributers } from "@/hooks/webs";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import UserAvatar from "../utility/UserAvatar";
import { useRouter } from "next/router";

function ContributorsBlock({ count }: { count: number }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const { webId } = router.query;

  const {
    data: contributors,
    isLoading: isContributorsLoading,
    isError: isContributorsError,
  } = useFetchContributers(webId as string);

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
    <UserAvatar
      showTooltip
      userId={contributor.id}
      dimension={32}
      extraTooltipContent={
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
      }
    />
  );

  return (
    <div className="px-4 py-2">
      <div className="flex items-center mb-4">
        <h2 className="text-md font-semibold text-foreground">Contributors</h2>
        <Badge className="ml-2 min-w-[23px] h-fit py-[2px] px-[4px] flex items-center justify-center text-xs">
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
                    <UserAvatar
                      key={contributor.id}
                      userId={contributor.id}
                      dimension={43}
                      showTooltip
                    />
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
