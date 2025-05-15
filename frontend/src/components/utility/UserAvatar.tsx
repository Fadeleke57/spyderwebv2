import React from "react";
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
  deactive,
  dimension = 48,
  showTooltip,
  extraTooltipContent,
}: {
  userId?: string;
  className?: string;
  dimension?: number;
  deactive?: boolean;
  showTooltip?: boolean;
  extraTooltipContent?: React.ReactNode;
}) {
  const router = useRouter();
  const { data: user } = useFetchUserById(userId);
  console.log("user", user);
  const username = user?.username;
  const profilepicurl = user?.profile_picture_url;

  const navigateOnClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (deactive) {
      return;
    }
    if (username) {
      router.push(`/user/${username}`);
    }
  };

  const imageDisplay = (
    <div
      className={cn(
        "rounded-full overflow-hidden border dark:bg-muted hover:border-blue-500 transition-all duration-200 ease-in-out",
        className
      )}
      style={{ width: dimension, height: dimension }}
      onClick={navigateOnClick}
    >
      {userId ? (
        <Image
          src={profilepicurl || `https://robohash.org/${userId}?size=300x300`}
          alt="Avatar"
          width={dimension}
          height={dimension}
          className="object-cover w-full h-full"
        />
      ) : (
        <Skeleton
          style={{ width: dimension, height: dimension }}
          className="rounded-full"
        />
      )}
    </div>
  );

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger>{imageDisplay}</TooltipTrigger>
        {user && showTooltip && (
          <TooltipContent side="top" className="p-0">
            <div className="p-2 max-w-sm">
              <div className="flex items-center mb-2 mt-1">
                <div className="mr-2">{imageDisplay}</div>
                <div>
                  <div className="font-bold text-foreground truncate">
                    {user.full_name || "Anonymous"}
                  </div>
                  <div className="text-sm text-gray-400 truncate">
                    @{user.username}
                  </div>
                </div>
              </div>
              {extraTooltipContent}
            </div>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}

export default UserAvatar;
