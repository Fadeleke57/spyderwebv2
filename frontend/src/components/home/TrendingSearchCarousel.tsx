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
import { Web } from "@/types/web";

export function TrendingSearchCarousel() {
  const { data: webs, isLoading: loading} = useFetchPopularWebs(10);
  const [websRendered, setWebsRendered] = useState<boolean>(false);

  useEffect(() => {
    if (webs && !loading) {
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
                  <div className="p-1 h-[200px] md:h-[250px] lg:h-[200px]">
                    <Skeleton className="w-full h-full rounded-xl" />
                  </div>
                </CarouselItem>
              ))
            : (webs || []).map((web: Web, index: number) => (
                <CarouselItem key={index} className="basis-1/2 lg:basis-1/5">
                  <TrendingSearchItem web={web} />
                </CarouselItem>
              ))}
        </CarouselContent>
        <CarouselPrevious className="dark:hover:text-black dark:hover:bg-neon hover:text-black hover:bg-neon" pointerPosition="right-14 -top-12" />
        <CarouselNext className="dark:hover:text-black dark:hover:bg-neon hover:text-black hover:bg-neon" pointerPosition="right-4 -top-12" />
      </Carousel>
    </div>
  );
}
