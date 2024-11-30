import React, { useState, useEffect, useRef } from "react";
import { useFetchPublicBuckets } from "@/hooks/buckets";
import { BucketCard } from "@/components/explore/BucketCard";
import { Bucket } from "@/types/bucket";
import { SearchInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import { formatText } from "@/lib/utils";
import { useUser } from "@/context/UserContext";
import { SkeletonCard, SkeletonUserCard } from "@/components/utility/SkeletonCard";
import Head from "next/head";
import { PlusCircle } from "lucide-react";
import UserAvatar from "@/components/utility/UserAvatar";
import useMediaQuery from "@/hooks/general";

function Index() {
  const { buckets, loading, error } = useFetchPublicBuckets();
  const [query, setQuery] = useState<string>("");
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
        <span key={index} className="bg-yellow-200">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const filteredBuckets =
    buckets?.filter(
      (bucket) =>
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
    <div className="flex flex-1 flex-col gap-8 py-2 lg:py-10 mx-auto w-full relative">
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
      <div className="px-4 lg:px-20">
        {!user && isMobile && (
          <Button
            className="w-full mb-2 bg-blue-500"
            onClick={() => router.push("/auth/register")}
          >
            Sign Up
          </Button>
        )}
        {!user && isMobile && (
          <Button
            className="w-full mb-4"
            onClick={() => router.push("/auth/login")}
          >
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
      <div className="w-full lg:min-h-[62vh] lg:px-16">
        {loading ? (
          <div className="w-full flex flex-col gap-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : error ? (
          <p>Error loading buckets</p>
        ) : currentBuckets.length > 0 ? (
          <div className="w-full grid grid-cols-1">
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
          <div className="px-4">
            <p>No buckets found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Index;
