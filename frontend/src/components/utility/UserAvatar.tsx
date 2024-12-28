import React from "react";
import { Button } from "../ui/button";
import Image from "next/image";
import { PublicUser } from "@/types/user";
import { Skeleton } from "../ui/skeleton";
import { cn } from "@/lib/utils";

function UserAvatar({ userId, className, width, height }: { userId?: string, className?: string, width?: number, height?: number }) {
  return (
    <Button
      variant="outline"
      size="icon"
      className={cn("rounded-full dark:bg-muted", className)}
    >
      {userId ? (
        <Image
          src={`https://robohash.org/${userId}?size=300x300`}
          alt="Avatar"
          width={width || 36}
          height={height || 36}
          className="rounded-full"
        />
      ) : (
        <Skeleton className="w-[36px] h-[36px]" />
      )}
    </Button>
  );
}

export default UserAvatar;
