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
import { useFetchUserBuckets } from "@/hooks/buckets";
import { formatText } from "@/lib/utils";
import { useRouter } from "next/router";
import { Skeleton } from "@/components/ui/skeleton";
import { NewBucketModal } from "../buckets/NewBucketModal";

export function ProjectsCarousel() {
  const {
    data : bucketData,
    fetchNextPage,
    fetchPreviousPage,
    isFetching,
    isFetchingNextPage,
    isFetchingPreviousPage,
  } = useFetchUserBuckets();
  const [buckets, setBuckets] = React.useState<any[]>([]);
  const router = useRouter();

  React.useEffect(() => {
    if (bucketData) {
      const pageData = bucketData.pages[0];
      setBuckets(pageData?.items || []);
    }
  }, [bucketData]);

  return (
    <div className="group pl-6 mt-4">
      <Carousel
        opts={{
          align: "start",
        }}
        className="w-full"
      >
        <CarouselContent>
          <NewBucketModal>
            <CarouselItem className="basis-11/12 lg:basis-1/3">
              <div className="p-1 cursor-pointer">
                <Card className="bg-muted dark:bg-card opacity-35 hover:opacity-75 duration-200 transition ease-in border-none">
                  <CardContent className="flex aspect-square items-center justify-center p-6">
                    {" "}
                    <span className="text-3xl font-semibold flex flex-row items-center text-muted-foreground">
                      <CopyPlus className="mr-2" />
                      Create
                    </span>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          </NewBucketModal>

          {isFetching
            ? Array.from({ length: 9 }).map((_, index) => (
                <CarouselItem
                  key={index}
                  className="basis-11/12 lg:basis-1/3 p-0"
                >
                  <Card className="h-full p-2 border-none">
                    <Skeleton className="w-full h-full rounded-lg" />
                  </Card>
                </CarouselItem>
              ))
            : buckets?.map((bucket, index) => (
                <CarouselItem
                  key={index}
                  className="basis-11/12 lg:basis-1/3"
                  onClick={() =>
                    router.push(`/buckets/bucket/${bucket.bucketId}`)
                  }
                >
                  <div className="p-1 cursor-pointer">
                    <Card className="">
                      <CardContent className="flex aspect-square items-center justify-center p-10">
                        <div className="w-full flex flex-col overflow-hidden hyphens-auto break-words">
                          <h1 className="text-xl font-semibold hyphens-auto">
                            {formatText(bucket.name, 50)}
                          </h1>
                          <p className="text-muted-foreground">
                            {formatText(bucket.description, 30)}
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
