"use client";

import Link from "next/link";

import { ArticleAsNode } from "@/types/article";
import { TrendingUp, TrendingDown, SquareArrowOutUpRight } from "lucide-react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  //change chart to be negative - see shadcn docs
  desktop: {
    label: "score",
    color: "#5ea4ff",
  },
} satisfies ChartConfig;

export function ArticleChart({ article }: { article: ArticleAsNode }) {
  let chart_sentiment_score = article.sentiment ? article.sentiment : 0;
  if (chart_sentiment_score < 0) {
    chart_sentiment_score = 0;
  }

  const chartData = [
    {
      data_point: "stmt",
      desktop: chart_sentiment_score,
    },
    {
      data_point: "subj",
      desktop: article.subjectivity ? article.subjectivity : 0,
    },
  ];

  function calc_reliability(polarity: GLfloat, subjectivity: GLfloat) {
    const reliability_subjectivity = 1.0 - subjectivity;
    const reliability_polarity = 1.0 - Math.abs(polarity);
    const reliability_index = reliability_subjectivity * reliability_polarity;
    return reliability_index;
  }

  const article_reliability =
    article.sentiment && article?.subjectivity
      ? calc_reliability(article?.sentiment, article?.subjectivity) * 100
      : 0;

  return (
    <Card className="relative">
      <Link href={article.link} target="_blank">
        <SquareArrowOutUpRight size={15} className="absolute right-4 top-4" />
      </Link>
      <CardHeader>
        <Link href={article.link} target="_blank" className="max-w-64">
          <CardTitle>{article.header}</CardTitle>
        </Link>
        <CardDescription>
          {article.author ? article.author : "No Author"} -{" "}
          {article.date_published
            ? article.date_published
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
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Article calculated at {article_reliability.toFixed(1)}% reliablily{" "}
          {article_reliability > 50 ? (
            <TrendingDown className="h-4 w-4" />
          ) : (
            <TrendingUp className="h-4 w-4" />
          )}
        </div>
        <div className="leading-none text-muted-foreground">
          Score based on sentiment and subjectivity.
        </div>
      </CardFooter>
    </Card>
  );
}
