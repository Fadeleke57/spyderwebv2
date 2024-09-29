import * as React from "react";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { CopyPlus } from "lucide-react";
import Link from "next/link";
import { useFetchBuckets } from "@/hooks/buckets";
export function ProjectsCarousel() {
  const { buckets, loading, error } = useFetchBuckets();
  return (
    <div className="group pl-6">
      <Carousel
        opts={{
          align: "start",
        }}
        className="w-full"
      >
        <CarouselContent>
          <CarouselItem className="basis-1/2 lg:basis-1/3">
            <div className="p-1 cursor-pointer">
              <Link href="/buckets/create">
                <Card className="bg-muted opacity-35 hover:opacity-75 duration-200 transition ease-in border-none">
                  <CardContent className="flex aspect-square items-center justify-center p-6">
                    <span className="text-3xl font-semibold flex flex-row items center text-slate-700">
                      <CopyPlus className="mr-2" />
                      Create
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </CarouselItem>
          {buckets?.map((bucket, index) => (
            <CarouselItem key={index} className="basis-1/2 lg:basis-1/3">
              <div className="p-1">
                <Card className="">
                  <CardContent className="flex aspect-square items-center justify-center p-10">
                    <div className="w-full flex flex-col overflow-hidden">
                      <h1 className="text-3xl font-semibold">
                        {bucket.name}
                      </h1>
                      <p className="text-slate-700">
                        {bucket.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
