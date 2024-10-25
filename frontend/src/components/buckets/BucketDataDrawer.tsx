import { ArticleAsNode, BucketConfigFormValues } from "@/types/article";
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import { ArticleInfoTabs } from "../terminal/ArticleInfoTabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import Link from "next/link";
import { SquareArrowOutUpRight, TrendingDown, TrendingUp } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";
import { Bar, XAxis, YAxis } from "recharts";
import { BarChart } from "recharts";
import { ChartConfig } from "../ui/chart";
type BucketDataDrawerProps = {
  source: ArticleAsNode;
  open: boolean;
  setOpen: (open: boolean) => void;
  config: BucketConfigFormValues;
};
function BucketDataDrawer({
  source,
  open,
  setOpen,
  config,
}: BucketDataDrawerProps) {
  let chart_sentiment_score = source.sentiment ? source.sentiment : 0;
  if (chart_sentiment_score < 0) {
    chart_sentiment_score = 0;
  }

  const chartConfig = {
    //change chart to be negative - see shadcn docs
    desktop: {
      label: "score",
      color: "#5ea4ff",
    },
  } satisfies ChartConfig;

  const chartData = [
    {
      data_point: "stmt",
      desktop: chart_sentiment_score,
    },
    {
      data_point: "subj",
      desktop: source.subjectivity ? source.subjectivity : 0,
    },
  ];
  return (
    <div className="grid grid-cols-2 gap-2">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side={"left"} className="w-[400px] sm:w-[540px]">
          <SheetHeader className="border-b pb-4">
            <SheetTitle className="text-left w-[300px] lg:w-content">
              Source Insights
            </SheetTitle>
            <SheetDescription className="text-left pr-4">
              {" "}
              A little information about this source
            </SheetDescription>
          </SheetHeader>
          <div className="py-6">
            <Card className="relative">
              <ScrollArea className="h-[calc(90vh-80px)] flex items-center">
                <Link href={source.link ? source.link : "/"} target="_blank">
                  <SquareArrowOutUpRight
                    size={15}
                    className="absolute right-4 top-4"
                  />
                </Link>
                <CardHeader>
                  <Link
                    href={source.link ? source.link : "/"}
                    target="_blank"
                    className="max-w-64"
                  >
                    <CardTitle>{source.header}</CardTitle>
                  </Link>
                  <CardDescription>
                    {source.author ? source.author : "No Author"} -{" "}
                    {source.date_published
                      ? source.date_published
                      : "No Published Date"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig}>
                    <BarChart
                      accessibilityLayer
                      data={chartData}
                      layout="vertical"
                      margin={{
                        left: -20,
                      }}
                    >
                      <XAxis type="number" dataKey="desktop" hide />
                      <YAxis
                        dataKey="data_point"
                        type="category"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        tickFormatter={(value) => value.slice(0, 4)}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <Bar
                        dataKey="desktop"
                        fill="var(--color-desktop)"
                        radius={5}
                      />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
                <CardFooter className="flex-col items-start gap-2 text-sm">
                  <div className="flex gap-2 font-medium leading-none">
                    source calculated at {source.reliability_score.toFixed(1)}%
                    reliablily
                    {source.reliability_score < 50 ? (
                      <TrendingDown className="h-4 w-4" />
                    ) : (
                      <TrendingUp className="h-4 w-4" />
                    )}
                  </div>
                  <div className="leading-none text-muted-foreground">
                    Score based on sentiment and subjectivity.
                  </div>
                </CardFooter>
              </ScrollArea>
            </Card>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default BucketDataDrawer;
