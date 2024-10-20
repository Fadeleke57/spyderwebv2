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
import { formatText } from "@/lib/utils";
import { useRouter } from "next/router";
import { Skeleton } from "@/components/ui/skeleton"; // Import skeleton

export function ProjectsCarousel() {
  const { buckets, loading, error } = useFetchBuckets(); // Fetch data
  const router = useRouter();

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
                    <span className="text-3xl font-semibold flex flex-row items-center text-slate-700">
                      <CopyPlus className="mr-2" />
                      Create
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </CarouselItem>

          {loading
            ?
              Array.from({ length: 9 }).map((_, index) => (
                <CarouselItem
                  key={index}
                  className="basis-1/2 lg:basis-1/3 p-0"
                >
                  <Card className="h-full p-2 border-none">
                    <Skeleton className="w-full h-full rounded-lg" />
                  </Card>
                </CarouselItem>
              ))
            :
              buckets?.map((bucket, index) => (
                <CarouselItem
                  key={index}
                  className="basis-1/2 lg:basis-1/3"
                  onClick={() =>
                    router.push(`/buckets/bucket/${bucket.bucketId}`)
                  }
                >
                  <div className="p-1 cursor-pointer">
                    <Card className="">
                      <CardContent className="flex aspect-square items-center justify-center p-10">
                        <div className="w-full flex flex-col overflow-hidden hyphens-auto break-words">
                          <h1 className="text-3xl font-semibold hyphens-auto">
                            {formatText(bucket.name, 50)}
                          </h1>
                          <p className="text-slate-700">
                            {formatText(bucket.description, 100)}
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
