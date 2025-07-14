import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { CopyPlus, Lock } from "lucide-react";
import { useFetchUserWebs } from "@/hooks/webs";
import { formatText } from "@/lib/utils";
import { useRouter } from "next/router";
import { Skeleton } from "@/components/ui/skeleton";
import { NewWebModal } from "../webs/NewWebModal";

export function ProjectsCarousel() {
  const {
    data: webData,
    isFetching,
  } = useFetchUserWebs();
  const [webs, setWebs] = React.useState<any[]>([]);
  const router = useRouter();

  React.useEffect(() => {
    if (webData) {
      const pageData = webData.pages[0];
      setWebs(pageData?.items || []);
    }
  }, [webData]);

  return (
    <div className="group pl-6 mt-4">
      <Carousel
        opts={{
          align: "start",
        }}
        className="w-full"
      >
        <CarouselContent>
          <NewWebModal>
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
          </NewWebModal>

          {isFetching
            ? Array.from({ length: 9 }).map((_, index) => (
                <CarouselItem
                  key={index}
                  className="basis-11/12 lg:basis-1/3 p-0"
                >
                  <Card className="h-full p-2 border-none bg-transparent">
                    <Skeleton className="w-full h-full rounded-lg" />
                  </Card>
                </CarouselItem>
              ))
            : webs?.map((web, index) => (
                <CarouselItem
                  key={index}
                  className="basis-11/12 lg:basis-1/3"
                  onClick={() => router.push(`/web/${web.webId}`)}
                >
                  <div className="p-1 cursor-pointer">
                    <Card className="">
                      <CardContent className="relative flex aspect-square items-center justify-center p-10">
                        <small className="absolute text-muted-foreground top-4 right-4 flex flex-row items-center">
                          {web.visibility}{" "}
                          {web.visibility === "Private" && <Lock className="ml-2" size={14} />}
                        </small>
                        <div className="w-full flex flex-col overflow-hidden hyphens-auto break-words">
                          <h1 className="text-xl font-semibold hyphens-auto">
                            {formatText(web.name, 50)}
                          </h1>
                          <p className="text-muted-foreground">
                            {formatText(web.description, 30)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
        </CarouselContent>

        <CarouselPrevious className="dark:hover:text-black dark:hover:bg-neon hover:text-black hover:bg-neon" pointerPosition="right-14 -top-12" />
        <CarouselNext className="dark:hover:text-black dark:hover:bg-neon hover:text-black hover:bg-neon" pointerPosition="right-4 -top-12" />
      </Carousel>
    </div>
  );
}
