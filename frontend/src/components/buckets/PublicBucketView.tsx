import React from "react";
import { Bucket } from "@/types/bucket";
import { PublicUser } from "@/types/user";
import { ChartContainer } from "@/components/ui/chart";
import { Textarea } from "@/components/ui/textarea";
import BucketChart from "./BucketChart";
import { Button } from "../ui/button";

function PublicBucketView({
  bucket,
  user,
}: {
  bucket: Bucket;
  user: PublicUser | null;
}) {
  return (
    <div className="grid w-full items-start gap-6">
      <div className="grid gap-6 rounded-lg pb-8 pt-4 px-4">
        <div>
          <div className="flex flex-col space-y-2">
            <small className="text-sm font-medium leading-none text-blue-500">{bucket?.visibility === "Private" ? "Private" : "Public"}</small>
            <span id="name" className="text-xl font-semibold">
              {bucket?.name || "Untitled"}
            </span>
            <span className="text-sm text-muted-foreground">
              {bucket?.description || "No description"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PublicBucketView;
