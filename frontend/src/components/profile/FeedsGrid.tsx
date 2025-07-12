import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ExternalLink, Info, Settings } from "lucide-react";
import { feedMap } from "@/lib/constants";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import SimpleTooltip from "../utility/SimpleTooltip";
import { cn } from "@/lib/utils";
import { environment } from "@/environment/loadenv";
import FeedsSettingsModal from "../feeds/FeedsSettings";
import { useState } from "react";
import { useFetchUserByUsername } from "@/hooks/user";
import { useRouter } from "next/router";

export const feedsDefinition = (
  <div className="font-base leading-relaxed">
    For AI feeds, if the{" "}
    <a
      href={`${environment.client_url}/memory`}
      className="hover:underline text-neon"
    >
      Spydr Memory MCP
    </a>{" "}
    is installed, calling the{" "}
    <span className="font-semibold bg-muted text-violet-400/80 p-1 rounded">
      AddToMemory
    </span>{" "}
    tool will automatically sync that client to your profile. Otherwise, all
    other apps require your explicit action to sync.
  </div>
);

export default function FeedGrid(
  { connected, isOwner }: { connected: string[]; isOwner: boolean } = {
    connected: [],
    isOwner: false,
  }
) {
  const router = useRouter();
  const { username } = router.query;
  const { data: resourceOwner, isLoading: resourceOwnerLoading } =
    useFetchUserByUsername(username as string);
  const feedsToMap = isOwner
    ? Object.values(feedMap)
    : Object.values(feedMap).filter((feed: any) => {
        return connected.includes(feed.name);
      });
  const [feedSettingsModalOpen, setFeedSettingsModalOpen] = useState(false);

  const ownerFeedsVisibility =
    resourceOwner &&
    (resourceOwner?.feedsVisibility === undefined ||
      resourceOwner?.feedsVisibility === null ||
      resourceOwner?.feedsVisibility === true);

  const canSeeFeeds = ownerFeedsVisibility || isOwner;

  if (resourceOwnerLoading) return <div>Loading...</div>;

  if (!canSeeFeeds) return <div className="text-center py-8 font-semibold">{resourceOwner?.full_name || "This user"} has hidden their feeds.</div>;

  return (
    <div>
      <div className="flex flew-row row-reverse justify-between items-center gap-2 mb-3">
        <SimpleTooltip content={feedsDefinition} p={4} delayDuration={200}>
          <div className="flex items-center cursor-pointer gap-2 group hover:bg-neon hover:text-black dark:hover:text-black transition-colors duration-200 rounded-full px-2 ease-in-out">
            <span className="font-semibold py-1 text-sm ">
              How are feeds synced?
            </span>
            <Info className="rounded-full" size={16} />
          </div>
        </SimpleTooltip>
        {isOwner && (
          <Button
            onClick={() => setFeedSettingsModalOpen(true)}
            className="flex items-center py-1 h-fit w-fit rounded-full text-sm transition-colors duration-150 hover:bg-neon hover:text-black dark:hover:text-black dark:hover:bg-neon"
          >
            <Settings size={16} className="mr-2" />
            <span className="font-semibold">Settings</span>
          </Button>
        )}
      </div>

      {canSeeFeeds && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {feedsToMap.map((feed: any, id: number) => {
            const isConnected = connected.includes(feed.name);
            return (
              <Card
                key={id}
                className={cn(
                  `relative group transition-colors duration-150 ${feed.category === "AI" && !isConnected ? "border-muted" : ""}`,
                  feed.disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
                )}
              >
                <div className="flex flex-col justify-between h-full">
                  <CardHeader className="flex flex-col justify-start gap-2">
                    <div
                      className={`h-16 w-16 group-hover:border-neon overflow-hidden border rounded flex items-center justify-center ${feed.name === "Tiktok" ? "bg-black" : "bg-foreground"} ${feed.zoom ? "p-2" : ""} transition-colors ease-in-out duration-150`}
                    >
                      <Image
                        src={feed.image}
                        alt={feed.name}
                        width={64}
                        height={64}
                        className="object-cover"
                      />
                    </div>

                    <div className="font-medium">{feed.name}</div>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {feed.description}
                  </CardContent>
                </div>

                <div className="absolute top-3 right-4">
                  {isConnected && (
                    <div className="flex items-center text-xs font-medium text-neon">
                      <TooltipProvider>
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger className="mr-2" asChild>
                            <div className="relative inline-flex items-center justify-center">
                              <div className="absolute rounded-full bg-neon/0 animate-pulse w-4 h-4 blur-sm"></div>
                              <div className="absolute rounded-full bg-neon/20 animate-pulse w-6 h-6 blur-md"></div>
                              <div className="relative rounded-full bg-neon w-2 h-2 flex items-center justify-center z-10"></div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            {feed.name} is connected.
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      Synced
                    </div>
                  )}

                  {!isConnected &&
                    isOwner &&
                    (!feed.disabled ? (
                      <Link
                        href={feed.syncLink || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-primary hover:text-black hover:bg-neon rounded-full px-2 py-1 transition-colors duration-150"
                      >
                        Sync
                      </Link>
                    ) : (
                      <div className="text-xs font-semibold bg-violet-400/40 border border-foreground rounded-full px-2 py-1">
                        Beta Access Only
                      </div>
                    ))}
                </div>
                <Link
                  href={feed.link || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-2 text-muted-foreground right-2 text-xs hover:text-black hover:bg-neon rounded-full px-2 py-1 transition-colors duration-150"
                >
                  <ExternalLink size={16} />
                </Link>
              </Card>
            );
          })}
        </div>
      )}
      <FeedsSettingsModal
        open={feedSettingsModalOpen}
        setOpen={setFeedSettingsModalOpen}
      />
    </div>
  );
}
