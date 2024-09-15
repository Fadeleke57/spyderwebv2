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
import useMediaQuery from "@/hooks/general";

export default function LandingCarousel() {
  const isMediaScreen = useMediaQuery("(max-width: 768px)");

  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true })
  );
  const router = Router;

  return (
    <div className="flex flex-col-reverse lg:flex-row items-center justify-center gap-10 lg:gap-20 w-full lg:pt-16 mb-10 lg:mb-0">
      <div className="px-6 w-1/3">
        <Carousel
          plugins={[plugin.current]}
          className="w-full min-h-96 max-w-xs ml-0 px-6 lg:px-0 lg:ml-12"
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
          orientation={"horizontal"}
        >
          <CarouselContent>
            {demoArticles.map((article, index) => (
              <CarouselItem key={index} className="md:basis-full lg:basis-full h-full w-full">
                <div className="p-1">
                  <ChartDemo article={article} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>

      <div className="w-2/3">
        <h1 className="scroll-m-20 text-3xl font-bold tracking-tight lg:text-5xl mb-2 lg:mb-4 text-blue-500 text-center lg:text-left ">
          Unbiased, accurate, and easy-to-use. Thousands of news articles all in
          one place.
        </h1>
        <Button
          variant={"link"}
          onClick={() => router.push("/auth/login")}
          className="hidden lg:inline text-xl p-0"
        >
          Learn how to use
        </Button>
      </div>
    </div>
  );
}
