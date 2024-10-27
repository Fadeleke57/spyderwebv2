import React from "react";
import { ChartContainer } from "../ui/chart";
import { BarChart, YAxis, XAxis, Bar, LabelList } from "recharts";
import { Bucket } from "@/types/bucket";
import { CardContent } from "../ui/card";

function BucketChart({ bucket }: { bucket: Bucket }) {
  return (
    <CardContent className="grid gap-4 p-0 py-4 px-0">
      <div className="grid auto-rows-min gap-2">
        <div className="flex items-baseline gap-1 text-2xl font-bold tabular-nums leading-none">
          {bucket.articleIds.length}
          <span className="text-sm font-normal text-muted-foreground">
            Sources Added
          </span>
        </div>
        <ChartContainer
          config={{
            steps: {
              label: "Sources",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="aspect-auto h-[32px] w-full"
        >
          <BarChart
            accessibilityLayer
            layout="vertical"
            margin={{
              left: 0,
              top: 0,
              right: 0,
              bottom: 0,
            }}
            data={[
              {
                date: "Number of Sources",
                steps: 5000,
              },
            ]}
          >
            <Bar
              dataKey="steps"
              fill="var(--color-steps)"
              radius={4}
              barSize={32}
            >
              <LabelList
                position="insideLeft"
                dataKey="date"
                offset={8}
                fontSize={12}
                fill="white"
              />
            </Bar>
            <YAxis dataKey="date" type="category" tickCount={1} hide />
            <XAxis dataKey="steps" type="number" hide />
          </BarChart>
        </ChartContainer>
      </div>
    </CardContent>
  );
}

export default BucketChart;
