import React from "react";
import Autoplay from "embla-carousel-autoplay";
import dynamic from "next/dynamic";
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
  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true })
  );
  const router = Router;

  return (
    <div className="flex flex-col-reverse lg:flex-row items-center justify-center gap-10 lg:pt-16 mb-10 lg:mb-0">
      <div className="px-6 lg:w-5/12 mx-auto flex items-start justify-start">
        <Carousel
          plugins={[plugin.current]}
          className="w-full max-w-xs lg:max-w-none"
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
        >
          <CarouselContent>
            {demoArticles.map((article, index) => (
              <CarouselItem
                key={index}
                className="basis-full lg:basis-full lg:h-full lg:w-full"
              >
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

      <div className="lg:w-7/12">
        <h1 className="scroll-m-20 text-3xl font-bold tracking-tight lg:text-5xl mb-2 lg:mb-4 text-blue-500">
          Unbiased, accurate, and easy-to-use. Thousands of news articles all in
          one place.
        </h1>
        <Button
          variant={"link"}
          onClick={() => router.push("/auth/login")}
          className="lg:inline text-xl p-0"
        >
          Learn how to use
        </Button>
      </div>
    </div>
  );
}
