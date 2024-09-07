import React from "react";
import Autoplay from "embla-carousel-autoplay";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ChartDemo } from "./ChartDemo";
import { demoArticles } from "@/types/article";
import { Button } from "../ui/button";
import Router from "next/router";

export function CarouselPlugin() {
  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true })
  );
  const router = Router;

  return (
    <div className="flex flex-row items-center justify-center gap-20 w-full py-12">
      <Carousel
        plugins={[plugin.current]}
        className="w-full max-w-xs ml-6 lg:ml-12"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent>
          {demoArticles.map((article, index) => (
            <CarouselItem key={index} className="md:basis-full lg:basis-full">
              <div className="p-1">
                <ChartDemo article={article} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      <div>
        <h1 className="scroll-m-20 text-3xl font-bold tracking-tight lg:text-5xl mb-2 lg:mb-4 text-blue-500">
          Unbiased, accurate, and easy-to-use. Thousands of news articles all in
          one place.
        </h1>
        <Button variant={"link"} onClick={() => router.push("/auth/login")} className="text-xl p-0">Learn how to use</Button>
      </div>
    </div>
  );
}
