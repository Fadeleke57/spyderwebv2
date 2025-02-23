import React from "react";
import { useFetchPopularBuckets } from "@/hooks/buckets";
import { Bucket } from "@/types/bucket";
import router from "next/router";
import { formatText } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";

function PopularBucketsCard() {
  const { data: popularBuckets} = useFetchPopularBuckets(3);
  return (
    <div className="hidden lg:flex flex-col basis-1/2 gap-2 border rounded-lg h-[calc(64vh-68px)] overflow-y-auto sticky top-[88px] p-4">
      <div className="rounded-md">
        <h1 className="text-xl font-bold mb-2">Popular</h1>
        <div className="flex flex-col gap-2">
          {popularBuckets ? (
            popularBuckets.map((bucket: Bucket) => (
              <div key={bucket.bucketId} className="cursor-pointer">
                <span className="text-xs text-muted-foreground">
                  {bucket.likes.length} stars
                </span>
                <br />
                <span
                  onClick={() =>
                    router.push(`/bucket/${bucket.bucketId}`)
                  }
                  className="text-sm font-semibold hover:underline"
                >
                  {formatText(bucket.name, 90)}
                </span>
              </div>
            ))
          ) : (
            <div className="flex flex-col gap-4">
              <Skeleton className="h-8 w-full rounded-xl" />
              <Skeleton className="h-8 w-full rounded-xl" />
              <Skeleton className="h-8 w-full rounded-xl" />
              <Skeleton className="h-8 w-full rounded-xl" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PopularBucketsCard;
