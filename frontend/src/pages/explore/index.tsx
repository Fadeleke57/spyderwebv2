import React, { useState, useEffect, useRef } from "react";
import { useFetchPopularBuckets, useFetchPublicBuckets } from "@/hooks/buckets";
import { BucketCard } from "@/components/explore/BucketCard";
import { Bucket } from "@/types/bucket";
import { SearchInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import { formatText } from "@/lib/utils";
import { useUser } from "@/context/UserContext";
import { SkeletonCard } from "@/components/utility/SkeletonCard";
import Head from "next/head";
import useMediaQuery from "@/hooks/general";
import { AuthModal } from "@/components/auth/AuthModal";
import { Skeleton } from "@/components/ui/skeleton";

function Index() {
  const { data: buckets, isLoading: loading, error } = useFetchPublicBuckets();
  const { data: popularBuckets } = useFetchPopularBuckets();
  const [query, setQuery] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [active, setActive] = useState<boolean>(false);
  const searchInputWrapperRef = useRef<any>(null);
  const bucketsPerPage = 20;
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchInputWrapperRef.current &&
        !searchInputWrapperRef.current.contains(event.target)
      ) {
        setActive(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    setCurrentPage(1);
  };

  const getHighlightedText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;

    const regex = new RegExp(`(${highlight})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 dark:bg-violet-400">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const filteredBuckets =
    buckets?.filter(
      (bucket: Bucket) =>
        bucket.name.toLowerCase().includes(query.toLowerCase()) ||
        bucket.description?.toLowerCase().includes(query.toLowerCase())
    ) || [];

  const indexOfLastBucket = currentPage * bucketsPerPage;
  const indexOfFirstBucket = indexOfLastBucket - bucketsPerPage;
  const currentBuckets = filteredBuckets.slice(
    indexOfFirstBucket,
    indexOfLastBucket
  );

  const totalPages = Math.ceil(filteredBuckets.length / bucketsPerPage);

  const isMobile = useMediaQuery("(max-width: 768px)");

  const title = query
    ? `Search Results for "${query}" - spydr`
    : "explore - spydr";
  const description = query
    ? `Discover buckets matching your query "${query}".`
    : "Explore public buckets on Spydr. Find shared research and projects.";
  return (
    <div className="flex flex-1 flex-col gap-4 pb-2 lg:pb-10 mx-auto w-full lg:h-[calc(108.9vh-64px)] overflow-y-auto relative">
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
      </Head>{" "}
      <div className="p-4 lg:px-16 border border-2 border-l-[1px] border-r-0 relative lg:sticky lg:top-0 bg-background lg:z-50">
        {!user && isMobile && (
          <Button
            className="w-full mb-2"
            variant={"secondary"}
            onClick={() => setOpen(true)}
          >
            Sign Up
          </Button>
        )}
        {!user && isMobile && (
          <Button className="w-full mb-4" onClick={() => setOpen(true)}>
            Login
          </Button>
        )}
        <SearchInput
          placeholder="What would you like to jump into?"
          onClick={() => setActive(true)}
          onChange={handleSearch}
          value={query}
        ></SearchInput>
      </div>
      <div className="w-full lg:px-16 flex flex row gap-6 relative">
        {loading ? (
          <div className="w-full flex flex-col gap-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : error ? (
          <p>Error loading buckets</p>
        ) : currentBuckets.length > 0 ? (
          <div className="w-full grid grid-cols-1 gap-1">
            {currentBuckets.map((bucket: Bucket) => (
              <div key={bucket.bucketId} className="cursor-pointer">
                <BucketCard
                  bucket={{
                    ...bucket,
                    name: getHighlightedText(
                      formatText(bucket.name, 140),
                      query
                    ) as string,
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 basis-11/12">
            <p>No buckets found</p>
          </div>
        )}

        <div className="hidden lg:flex flex-col basis-1/2 gap-2 border rounded-lg h-[calc(64vh-68px)] overflow-y-auto sticky top-[80px] p-4">
          <div className="rounded-md">
            <h1 className="text-xl font-bold mb-2">Popular</h1>
            <div className="flex flex-col gap-2">
              {popularBuckets ? (
                popularBuckets.map((bucket: Bucket) => (
                  <div key={bucket.bucketId} className="cursor-pointer">
                    <span className="text-xs text-muted-foreground">
                      {bucket.likes.length} upvotes
                    </span>
                    <br />
                    <span
                      onClick={() =>
                        router.push(`/buckets/bucket/${bucket.bucketId}`)
                      }
                      className="text-sm font-semibold hover:underline"
                    >
                      {formatText(bucket.name, 90)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex flex-col gap-4">
                  <Skeleton className="h-8 w-full rounded-xl" />
                  <Skeleton className="h-8 w-full rounded-xl" />
                  <Skeleton className="h-8 w-full rounded-xl" />
                  <Skeleton className="h-8 w-full rounded-xl" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {open && (
        <AuthModal
          type="login"
          referrer="explore"
          open={open}
          setOpen={setOpen}
        />
      )}
    </div>
  );
}

export default Index;
