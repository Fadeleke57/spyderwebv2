import * as React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bucket } from "@/types/bucket";
import { formatText } from "@/lib/utils";
import Link from "next/link";

export function BucketCard({ bucket }: { bucket: Bucket }) {
  return (
    <Link href={`/buckets/bucket/${bucket.bucketId}`}>
      <Card className="w-[350px] h-[200px]">
        <CardHeader className="overflow-hidden">
          <CardTitle className="break-words hover:cursor-pointer hover:text-blue-500">
            <h3 className="hyphens-auto">{formatText(bucket.name, 50)}</h3>
          </CardTitle>
          <CardDescription className="hyphens-auto">
            {formatText(bucket.description, 140)}
          </CardDescription>
        </CardHeader>
        <CardContent>
        </CardContent>
      </Card>
    </Link>
  );
}
