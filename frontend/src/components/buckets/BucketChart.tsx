import React from "react";
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
      </div>
    </CardContent>
  );
}

export default BucketChart;
