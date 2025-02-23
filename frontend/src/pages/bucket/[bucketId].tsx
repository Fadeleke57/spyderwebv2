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
import ShareDialog from "@/components/utility/ShareButton";
import UserAvatar from "@/components/utility/UserAvatar";
import {
  SkeletonTextCard,
  SkeletonUserCard,
} from "@/components/utility/SkeletonCard";
import Head from "next/head";
import { Bucket } from "@/types/bucket";
import { IterationCcw } from "lucide-react";
import { IterateModal } from "@/components/utility/IterateModal";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/AuthModal";

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
  const [showIterateModal, setShowIterateModal] = React.useState(false);
  const [authModalOpen, setAuthModalOpen] = React.useState(false);
  useEffect(() => {
    if (bucketData) {
      setBucket(bucketData);
    }
  });

  const { data: bucketOwner, isLoading: bucketOwnerLoading } = useFetchUserById(
    bucket?.userId as string
  );

  const { data: iteratedFromUser, isLoading: iteratedFromLoading } =
    useFetchUserById(bucket?.iteratedFrom ? bucket?.iteratedFrom : "");

  const { user } = useUser();
  const isOwner = user?.id === bucketOwner?.id;

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
    <div className="grid h-[90svh] mid:h-screen lg:h-screen w-full overflow-hidden scrollbar-none">
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
        <header className="sticky top-0 z-10 flex h-[80px] lg:h[55px] items-center justify-between gap-1 border-b bg-background px-4">
          <div className="flex z-40 items-center gap-2 mb-3 lg:mb-0  max-w-[210px] lg:max-w-2xl">
            {loading || bucketOwnerLoading ? (
              <SkeletonUserCard />
            ) : (
              <>
                <UserAvatar userId={bucket?.userId} />{" "}
                <div className="flex flex-col gap-0">
                  <h1 className="text-xs md:text-base lg:text-sm font-semibold m-0">
                    {bucketOwner?.username || ""}{" "}
                  </h1>
                  {bucket?.iteratedFrom ? (
                    <p className="text-xs font-normal text-muted-foreground">
                      Iterated From{" "}
                      <span className="font-semibold text-blue-500 dark:text-blue-400">
                        @{iteratedFromUser?.username}
                      </span>
                    </p>
                  ) : (
                    ""
                  )}

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
          <div className="flex items-center gap-2 mb-3 lg:mb-0">
            {bucket && (
              <MobileBucketForm bucket={bucket} user={user ? user : null} />
            )}

            {user && bucket && bucketOwner ? (
              <IterateModal
                open={showIterateModal}
                setIsOpen={setShowIterateModal}
                bucket={bucket}
              >
                <Button
                  disabled={
                    bucket.iterations.includes(user?.id || "") ||
                    bucketOwner.id === user?.id
                  }
                  size="sm"
                  variant={"outline"}
                >
                  <span className="hidden md:inline lg:inline">Iterate </span>
                  <IterationCcw
                    className="md:ml-2 lg:ml-2"
                    size={16}
                    onClick={() => setShowIterateModal(true)}
                  />
                </Button>
              </IterateModal>
            ) : (
              <Button
                size="sm"
                variant={"outline"}
                onClick={() => setAuthModalOpen(true)}
              >
                <span className="hidden md:inline lg:inline">Iterate </span>
                <IterationCcw className="md:ml-2 lg:ml-2" size={16} />
              </Button>
            )}

            <ShareDialog
              link={`${window.location.origin}/bucket/${bucketId}`}
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
                <BucketForm bucket={bucket} user={user ? user : null} />
              ) : bucket ? (
                <PublicBucketView bucket={bucket} />
              ) : null}
            </ScrollArea>
          )}
          {loading ? (
            <div className="flex h-full min-h-[50vh] flex-col rounded-xl bg-muted/50 lg:col-span-2"></div>
          ) : bucket ? (
            <BucketPlayground
              bucket={bucket}
              user={user ? user : null}
              refetch={refetch}
            />
          ) : null}
        </div>
      </div>
      <AuthModal
        referrer={"bucket"}
        type="login"
        open={authModalOpen}
        setOpen={setAuthModalOpen}
      />
    </div>
  );
}

export default Index;
