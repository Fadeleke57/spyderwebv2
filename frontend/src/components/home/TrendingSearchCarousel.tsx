import * as React from "react";
import { useState, useEffect } from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useFetchPopularBuckets, useFetchPublicBuckets } from "@/hooks/buckets";
import { useRouter } from "next/router";
import { Skeleton } from "../ui/skeleton";
import TrendingSearchItem from "./TrendingSearchItem";
import { Bucket } from "@/types/bucket";

export function TrendingSearchCarousel() {
  const { data: buckets, isLoading : loading, error } = useFetchPopularBuckets(10);
  const [bucketsRendered, setBucketsRendered] = useState<boolean>(false);
  const [displayBuckets, setDisplayBuckets] = useState<any[]>(
    Array.from({ length: 9 })
  );

  const router = useRouter();

  useEffect(() => {
    if (buckets && !loading) {
      setDisplayBuckets(buckets);
      setBucketsRendered(true);
    }

  }, [buckets, loading]);

  return (
    <div className="relative group pl-6 mt-4 mb-6 lg:mb-0">
      <Carousel
        opts={{
          align: "start",
        }}
        className="w-full"
      >
        <CarouselContent>
          {!bucketsRendered
            ? Array.from({ length: 9 }).map((_, index) => (
                <CarouselItem key={index} className="basis-1/2 lg:basis-1/5">
                  <Skeleton className="md:w-[250px] md:h-[250px] lg:w-[200px] lg:h-[200px] rounded-xl" />
                </CarouselItem>
              ))
            : displayBuckets.map((bucket, index) => (
                <CarouselItem key={index} className="basis-1/2 lg:basis-1/5">
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
