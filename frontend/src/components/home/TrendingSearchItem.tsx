import React from "react";
import { Bucket } from "@/types/bucket";
import { formatText } from "@/lib/utils";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/router";
function TrendingSearchItem({ bucket }: { bucket: Bucket }) {
  const router = useRouter();
  return (
    <div className="p-1">
      <Card
        className="p-0 relative cursor-pointer hover:opacity-50 duration-00 transition ease-in"
        onClick={() => router.push(`/bucket/${bucket.bucketId}`)}
      >
        <CardContent className="flex aspect-square items-center justify-center p-6">
          <span className="text-xs lg:text-md font-semibold">
            {formatText(bucket.name, 60)}
          </span>
        </CardContent>
        <div className="absolute bottom-3 right-3 flex flex-row items-center space-x-2 text-zinc-400 dark:text-muted-foreground">
          <span className="text-xs">{bucket.likes.length}</span>
          <Star
            className="fill-zinc-400 dark:fill-muted-foreground"
            size={16}
          />
        </div>
      </Card>
    </div>
  );
}

export default TrendingSearchItem;
