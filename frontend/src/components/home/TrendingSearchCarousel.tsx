import * as React from "react";
import { useState, useEffect } from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useFetchPublicBuckets } from "@/hooks/buckets";
import { useRouter } from "next/router";
import { Skeleton } from "../ui/skeleton";
import TrendingSearchItem from "./TrendingSearchItem";
import { Bucket } from "@/types/bucket";

export function TrendingSearchCarousel() {
  const { data: buckets, isLoading : loading, error } = useFetchPublicBuckets();
  const [bucketsRendered, setBucketsRendered] = useState<boolean>(false);
  const [displayBuckets, setDisplayBuckets] = useState<any[]>(
    Array.from({ length: 9 })
  );

  const router = useRouter();

  // Update displayBuckets when the actual buckets are loaded
  useEffect(() => {
    if (buckets && !loading) {
      setDisplayBuckets(buckets.sort((a : Bucket, b: Bucket) => b.likes.length - a.likes.length).slice(0, 9));
      setBucketsRendered(true);
    }

  }, [buckets, loading]);

  return (
    <div className="relative group pl-6 mt-4">
      <Carousel
        opts={{
          align: "start",
        }}
        className="w-full"
      >
        <CarouselContent>
          {!bucketsRendered
            ? Array.from({ length: 9 }).map((_, index) => (
                <CarouselItem key={index} className="basis-1/3 lg:basis-1/5">
                  <Skeleton className="md:w-[250px] md:h-[250px] lg:w-[200px] lg:h-[200px] rounded-xl" />
                </CarouselItem>
              ))
            : displayBuckets.map((bucket, index) => (
                <CarouselItem key={index} className="basis-1/3 lg:basis-1/5">
                  <TrendingSearchItem bucket={bucket} />
                </CarouselItem>
              ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
