import { useFetchLikedBuckets } from "@/hooks/buckets";
import { Skeleton } from "../ui/skeleton";
import { formatText } from "@/lib/utils";
import { ScrollArea } from "../ui/scroll-area";
import Link from "next/link";
import { useRouter } from "next/router";

function FindBucketsBlock() {
  const { buckets, loading, error } = useFetchLikedBuckets();
  const loadedBuckets = buckets.slice(0, 5);
  const router = useRouter();
  return (
    <ScrollArea className="relative p-2 w-full rounded-md flex-col border h-80">
      <div className="max-w-3xl mx-auto p-4 font-sans">
        <div className="space-y-4">
          {loadedBuckets.map((bucket, index) => (
            <div
              key={index}
              className="max-w-2xl bg-slate-100 rounded-lg p-4 cursor-pointer hover:scale-110 duration-200 transition ease-in"
              onClick={() => router.push(`/buckets/bucket/${bucket.bucketId}`)}
            >
              <div className="group">
                <h3 className="text-2xl font-medium">
                  {formatText(bucket.name, 45)}
                </h3>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatText(bucket.description, 40)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}

export default FindBucketsBlock;
