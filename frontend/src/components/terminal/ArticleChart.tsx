"use client";

import axios from "axios";
import Link from "next/link";

import { useEffect, useState } from "react";
import { Article } from "@/types/article";
import { TrendingUp } from "lucide-react";
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
  desktop: {
    label: "Score",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function ArticleChart({ article_id }: { article_id: string }) {
  const [data, setData] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const chartData = [
    {
      data_point: "stmt",
      desktop: data?.sentiment ? data.sentiment : 0,
    },
    {
      data_point: "subj",
      desktop: data?.subjectivity ? data.subjectivity : 0,
    },
  ];

  function calc_reliability(polarity : GLfloat, subjectivity : GLfloat) {
        const reliability_subjectivity = 1.0 - subjectivity;
        const reliability_polarity = 1.0 - Math.abs(polarity);
        const reliability_index = reliability_subjectivity * reliability_polarity;
        return reliability_index;
  }

  const article_reliability = data?.sentiment && data?.subjectivity ? calc_reliability(data?.sentiment, data?.subjectivity) * 100 : 0;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:8000/article/${article_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const articleData = response.data?.result?.[0]?.[0];
        setData(articleData);
      } catch (error) {
        setError("Failed to fetch article data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [article_id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!data) return <p>No data available</p>;

  return (
    <Card>
      <CardHeader>
        <Link href={data.link} target="_blank">
          <CardTitle>{data.header}</CardTitle>
        </Link>
        <CardDescription>
          {data.author} - {data.date_published}
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
          Article calculated at {article_reliability.toFixed(1)}% reliablily <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Score based on sentiment and subjectivity.
        </div>
      </CardFooter>
    </Card>
  );
}
