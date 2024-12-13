import React, { useEffect } from "react";
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
import { Bucket } from "@/types/bucket";

function Index() {
  const router = useRouter();
  const { bucketId } = router.query;
  const {
    data: bucketData,
    isLoading: loading,
    error,
    refetch,
  } = useFetchBucketById(bucketId as string);
  const [bucket, setBucket] = React.useState<Bucket | null>(bucketData || null);
  useEffect(() => {
    if (bucketData) {
      setBucket(bucketData);
    }
  });
  const { data: bucketOwner, isLoading: bucketOwnerLoading } = useFetchUserById(
    bucket?.userId as string
  );
  const { user } = useUser();
  const isOwner = user?.id === bucket?.userId;

  const title = loading ? "Loading..." : bucket?.name || "Bucket Details";
  const description = loading
    ? "Fetching bucket details..."
    : bucket?.description || "View and explore bucket details.";

  if (error) {
    return (
      <div className="grid h-screen w-full overflow-hidden scrollbar-none">
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
        <div className="flex h-full w-full flex-col items-center justify-center">
          <h1 className="text-2xl font-semibold">Bucket not found</h1>
          <p className="text-muted-foreground">
            The bucket you are looking for does not exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid h-screen w-full overflow-hidden scrollbar-none">
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
                      formatDistanceToNow(new Date(bucket.updated + "Z"), {
                        addSuffix: true,
                      })}
                  </span>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {bucket && <MobileBucketForm bucket={bucket} user={user} />}
            <ShareButton
              link={`${window.location.origin}/buckets/bucket/${bucketId}`}
            />
          </div>
        </header>
        <div className="grid flex-1 gap-4 overflow-auto p-4 md:grid-cols-2 lg:grid-cols-3 overflow-hidden scrollbar-none">
          {loading ? (
            <SkeletonTextCard />
          ) : (
            <ScrollArea
              className="relative h-[calc(90vh-18px)] hidden flex-col items-start gap-8 md:flex"
              x-chunk="dashboard-03-chunk-0"
            >
              {bucket && isOwner ? (
                <BucketForm bucket={bucket} user={user} />
              ) : bucket ? (
                <PublicBucketView bucket={bucket} user={user} />
              ) : null}
            </ScrollArea>
          )}
          {loading ? (
            <div className="relative flex h-full min-h-[50vh] flex-col rounded-xl bg-muted/50 lg:col-span-2"></div>
          ) : bucket ? (
            <BucketPlayground bucket={bucket} user={user} refetch={refetch} />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default Index;
