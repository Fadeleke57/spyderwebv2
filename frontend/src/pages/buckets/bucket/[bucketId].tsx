import React from "react";
import { useRouter } from "next/router";
import { useFetchBucketById } from "@/hooks/buckets";
import { Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatText } from "@/lib/utils";
import { useUser } from "@/context/UserContext";
import BucketPlayground from "@/components/buckets/BucketPlayground";
import BucketForm from "@/components/buckets/BucketForm";
import MobileBucketForm from "@/components/buckets/MobileBucketForm";
import PublicBucketView from "@/components/buckets/PublicBucketView";
import { useFetchUserById } from "@/hooks/user";
import { formatDistanceToNow } from "date-fns";
import { ShareButton } from "@/components/utility/ShareButton";

function Index() {
  const router = useRouter();
  const { bucketId } = router.query;
  const { bucket, loading, error } = useFetchBucketById(bucketId as string);
  const { user: bucketOwner, loading: bucketOwnerLoading } = useFetchUserById(
    bucket?.userId as string
  );
  const { user } = useUser();
  const isOwner = user && user?.id === bucket?.userId;

  return loading || bucketOwnerLoading ? (
    <div className="grid h-screen w-full"></div>
  ) : (
    <div className="grid h-screen w-full">
      <div className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-[57px] items-center justify-between gap-1 border-b bg-background px-4">
          <h1 className="text-xs md:text-md lg:text-lg font-semibold">
            {bucketOwner?.full_name || "Bucket"} -{" "}
            {formatDistanceToNow(new Date(bucket.updated), { addSuffix: true })}
          </h1>
          <MobileBucketForm bucket={bucket} user={user} />
          <ShareButton link={`${window.location.origin}/buckets/bucket/${bucketId}`} />
        </header>
        <main className="grid flex-1 gap-4 overflow-auto p-4 md:grid-cols-2 lg:grid-cols-3">
          <ScrollArea
            className="relative h-[calc(90vh-18px)] hidden flex-col items-start gap-8 md:flex"
            x-chunk="dashboard-03-chunk-0"
          >
            {isOwner ? (
              <BucketForm bucket={bucket} user={user} />
            ) : (
              <PublicBucketView bucket={bucket} user={user} />
            )}
          </ScrollArea>
          <BucketPlayground bucket={bucket} user={user} />
        </main>
      </div>
    </div>
  );
}

export default Index;
