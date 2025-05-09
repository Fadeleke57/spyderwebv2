import React from "react";
import { Button } from "../ui/button";
import Image from "next/image";
import { Skeleton } from "../ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { useRouter } from "next/router";
import { useFetchUserById } from "@/hooks/user";

function UserAvatar({
  userId,
  className,
  width,
  height,
  username,
}: {
  userId?: string;
  username?: string;
  className?: string;
  width?: number;
  height?: number;
}) {
  const router = useRouter();
  const { data: user } = useFetchUserById(userId);
  const navigateOnClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (username) {
      router.push(`/user/${username}`);
    }
  };

  const profilePicUrl = user?.profile_picture_url;
  console.log("user", user);
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "rounded-full dark:bg-muted",
              className,
              `w-[${width}px] h-[${height}px]`
            )}
            onClick={navigateOnClick}
          >
            {userId ? (
              <Image
                src={
                  profilePicUrl || `https://robohash.org/${userId}?size=300x300`
                }
                alt="Avatar"
                width={width || 36}
                height={height || 36}
                className="rounded-full"
              />
            ) : (
              <Skeleton className="w-[36px] h-[36px]" />
            )}
          </Button>
        </TooltipTrigger>
        {username && (
          <TooltipContent side="bottom" className="p-0">
            <div className="p-4 max-w-xs flex flex-col">
              <Button
                variant={"link"}
                onClick={(e: React.MouseEvent) => navigateOnClick(e)}
                className="text-sm text-muted-foreground p-0 m-0 h-fit w-fit"
              >
                View profile
              </Button>
            </div>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}

export default UserAvatar;
