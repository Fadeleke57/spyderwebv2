import React from "react";
import { Button } from "../ui/button";
import Image from "next/image";
import { PublicUser } from "@/types/user";
import { Skeleton } from "../ui/skeleton";

function UserAvatar({ userId }: { userId?: string }) {
  return (
    <Button
      variant="outline"
      size="icon"
      className="rounded-full"
    >
      {userId ? (
        <Image
          src={`https://robohash.org/${userId}?size=300x300`}
          width={36}
          height={36}
          alt="Avatar"
          className="rounded-full"
        />
      ) : (
        <Skeleton className="w-[36px] h-[36px]" />
      )}
    </Button>
  );
}

export default UserAvatar;
