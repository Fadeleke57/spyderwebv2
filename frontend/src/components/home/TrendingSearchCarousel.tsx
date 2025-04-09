import * as React from "react";
import { useState, useEffect } from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useFetchPopularWebs } from "@/hooks/webs";
import { Skeleton } from "../ui/skeleton";
import TrendingSearchItem from "./TrendingSearchItem";

export function TrendingSearchCarousel() {
  const { data: webs, isLoading: loading, error } = useFetchPopularWebs(10);
  const [websRendered, setWebsRendered] = useState<boolean>(false);
  const [displayWebs, setDisplayWebs] = useState<any[]>(
    Array.from({ length: 9 })
  );

  useEffect(() => {
    if (webs && !loading) {
      setDisplayWebs(webs);
      setWebsRendered(true);
    }
  }, [webs, loading]);

  return (
    <div className="relative group pl-6 mt-4 mb-6 lg:mb-0">
      <Carousel
        opts={{
          align: "start",
        }}
        className="w-full"
      >
        <CarouselContent>
          {!websRendered
            ? Array.from({ length: 9 }).map((_, index) => (
                <CarouselItem key={index} className="basis-1/2 lg:basis-1/5">
                  <Skeleton className="md:w-[250px] md:h-[250px] lg:w-[150px] lg:h-[150px] rounded-xl" />
                </CarouselItem>
              ))
            : displayWebs.map((web, index) => (
                <CarouselItem key={index} className="basis-1/2 lg:basis-1/5">
                  <TrendingSearchItem web={web} />
                </CarouselItem>
              ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
