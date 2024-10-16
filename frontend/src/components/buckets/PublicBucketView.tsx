import React from "react";
import { Bucket } from "@/types/bucket";
import { PublicUser } from "@/types/user";
import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";

function PublicBucketView({
  bucket,
  user,
}: {
  bucket: Bucket;
  user: PublicUser | null;
}) {
  return (
    <div className="grid w-full items-start gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{bucket?.name}</CardTitle>
          <CardDescription className="text-muted-foreground">
            {bucket?.description ? bucket.description : "No description"}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
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
                  label: "Steps",
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
                    date: "Number of Sources in Bucket",
                    steps: 12435,
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
          <div className="grid auto-rows-min gap-2">
            <div className="flex items-baseline gap-1 text-2xl font-bold tabular-nums leading-none">
              {bucket.likes.length}
              <span className="text-sm font-normal text-muted-foreground">
                reliabillity
              </span>
            </div>
            <ChartContainer
              config={{
                steps: {
                  label: "Steps",
                  color: "hsl(var(--muted))",
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
                    date: "Average Reliability Score",
                    steps: 10103,
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
                    fill="hsl(var(--muted-foreground))"
                  />
                </Bar>
                <YAxis dataKey="date" type="category" tickCount={1} hide />
                <XAxis dataKey="steps" type="number" hide />
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PublicBucketView;
