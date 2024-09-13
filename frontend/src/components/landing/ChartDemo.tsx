"use client";
import { Bar, BarChart, CartesianGrid, Cell, LabelList } from "recharts";
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
import { demoArticleType } from "@/types/article";

export function ChartDemo({ article }: { article: demoArticleType }) {
  const chartData = [
    { month: "", score: article.sentiment },
    { month: "", score: article.subjectivity },
  ];
  const chartConfig = {
    score: {
      label: "Score",
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader className="flex flex-col items-start gap-1">
        <div className="flex inline-flex gap-2 text-sm">
          <span className={`text-${article.topics[0].color}-500`}>
            {article.topics[0].name}
          </span>
          <span className={`text-${article.topics[1].color}-500`}>
            {article.topics[1].name}
          </span>
        </div>
        <span className="text-xl font-semibold">{article.title}</span>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel hideIndicator />}
            />
            <Bar dataKey="score">
              <LabelList position="top" dataKey="month" fillOpacity={1} />
              {chartData.map((item) => (
                <Cell
                  key={item.month}
                  fill={item.score > 0 ? "#3b82f6" : "#bfdbfe"}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
