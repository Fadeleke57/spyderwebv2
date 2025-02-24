//explore
import React, { useState, useEffect } from "react";
import {
  useFetchPublicBuckets,
  useSearchBuckets,
} from "@/hooks/buckets";
import { BucketCard } from "@/components/explore/BucketCard";
import { Bucket } from "@/types/bucket";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import { useUser } from "@/context/UserContext";
import Head from "next/head";
import useMediaQuery from "@/hooks/general";
import { AuthModal } from "@/components/auth/AuthModal";
import SearchBar from "@/components/utility/Searchbar";
import { SearchResultCard } from "@/components/explore/SearchResult";
import { LoaderCircle } from "lucide-react";
import PopularBucketsCard from "@/components/explore/PopularBucketsCard";
import SpydrAI from "@/components/utility/Assistant";

function Index() {
  const { ref, inView } = useInView();
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFetchPublicBuckets();
  const [query, setQuery] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const { user } = useUser();
  const router = useRouter();

  const { data: searchResults, isLoading: isSearchLoading } = useSearchBuckets(
    query,
    { visibility: "Public" }
  );

  useEffect(() => {
    if (inView && hasNextPage && !query) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage, query]);

  const allBuckets = data?.pages.flatMap((page) => page.result) || [];
  const displayBuckets = query ? searchResults || [] : allBuckets;

  const isMobile = useMediaQuery("(max-width: 768px)");

  const title = query
    ? `Search Results for "${query}" - spydr`
    : "explore - spydr";
  const description = query
    ? `Discover buckets matching your query "${query}".`
    : "Explore public buckets on Spydr. Find shared research and projects.";

  const handleSearch = (searchQuery: string, results: any) => {
    setQuery(searchQuery);
  };
  

  return (
    <div className="flex flex-1 flex-col gap-4 pb-10 mx-auto w-full lg:h-[calc(108.9vh-64px)] overflow-y-auto relative">
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
      <div>

      </div>
      <div className="p-4 lg:px-16 border-b-2 border-l-[1px] border-r-0 relative lg:sticky lg:top-0 bg-background lg:z-50">
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
        <SearchBar onSearch={handleSearch} initialQuery={query} />
      </div>
      <div className="w-full lg:px-16 flex flex-row gap-6 relative">
        {isSearchLoading && <LoaderCircle className="animate-spin" />}
        <div className="w-full flex flex-col gap-1">
          {error && <p>Error loading buckets</p>}
          {query && (
            <p className="mb-4 font-semibold ml-2 lg:ml-0">
              Results for &quot;{query}&quot;
            </p>
          )}
          {isLoading ? (
            <LoaderCircle className="animate-spin mx-auto" />
          ) : (
            displayBuckets.map((bucket: Bucket) => (
              <div key={bucket.bucketId} className="cursor-pointer">
                {query ? (
                  <SearchResultCard user={user || null} bucket={bucket} />
                ) : (
                  <BucketCard user={user || null} bucket={bucket} />
                )}
              </div>
            ))
          )}

          {!query && (
            <div ref={ref} className="h-10 w-full">
              {isFetchingNextPage && (
                <div className="w-full flex flex-col items-center justify-center gap-3">
                  <LoaderCircle className="animate-spin" />
                </div>
              )}
            </div>
          )}
        </div>
        <PopularBucketsCard />
      </div>
      {open && (
        <AuthModal
          type="login"
          referrer="explore"
          open={open}
          setOpen={setOpen}
        />
      )}
      <SpydrAI />
    </div>
  );
}

export default Index;
