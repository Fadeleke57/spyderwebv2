import React from "react";
import { useRouter } from "next/router";
import { useFetchBucketById } from "@/hooks/buckets";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser } from "@/context/UserContext";
import BucketPlayground from "@/components/buckets/BucketPlayground";
import BucketForm from "@/components/buckets/BucketForm";
import MobileBucketForm from "@/components/buckets/MobileBucketForm";
import PublicBucketView from "@/components/buckets/PublicBucketView";
import { useFetchUserById } from "@/hooks/user";
import { formatDistanceToNow } from "date-fns";
import { ShareButton } from "@/components/utility/ShareButton";
import UserAvatar from "@/components/utility/UserAvatar";
import {
  SkeletonCard,
  SkeletonTextCard,
  SkeletonUserCard,
} from "@/components/utility/SkeletonCard";
import Head from "next/head";

function Index() {
  const router = useRouter();
  const { bucketId } = router.query;
  const { bucket, loading, error, refetch } = useFetchBucketById(
    bucketId as string
  );
  const { user: bucketOwner, loading: bucketOwnerLoading } = useFetchUserById(
    bucket?.userId as string
  );
  const { user } = useUser();
  const isOwner = user?.id === bucket?.userId;

  const title = loading ? "Loading..." : bucket?.name || "Bucket Details";
  const description = loading
    ? "Fetching bucket details..."
    : bucket?.description || "View and explore bucket details.";

  return (
    <div className="grid h-screen w-full">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta
          property="og:url"
          content={`${
            typeof window !== "undefined" ? window.location.href : ""
          }`}
        />
      </Head>
      <div className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-[57px] items-center justify-between gap-1 border-b bg-background px-4">
          <div className="flex items-center gap-2">
            {loading || bucketOwnerLoading ? (
              <SkeletonUserCard />
            ) : (
              <>
                <UserAvatar userId={bucket?.userId} />{" "}
                <div className="flex flex-col gap-0">
                  <h1 className="text-xs md:text-base lg:text-sm font-semibold m-0">
                    {bucketOwner?.full_name || "Bucket"}{" "}
                  </h1>
                  <span className="text-xs text-muted-foreground font-normal m-0">
                    {bucket?.updated &&
                      formatDistanceToNow(new Date(bucket?.updated), {
                        addSuffix: true,
                      })}
                  </span>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <MobileBucketForm bucket={bucket} user={user} />
            <ShareButton
              link={`${window.location.origin}/buckets/bucket/${bucketId}`}
            />
          </div>
        </header>
        <main className="grid flex-1 gap-4 overflow-auto p-4 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <SkeletonTextCard />
          ) : (
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
          )}
          {loading ? (
            <div className="relative flex h-full min-h-[50vh] flex-col rounded-xl bg-muted/50 lg:col-span-2"></div>
          ) : (
            <BucketPlayground bucket={bucket} user={user} refetch={refetch} />
          )}
        </main>
      </div>
    </div>
  );
}

export default Index;
