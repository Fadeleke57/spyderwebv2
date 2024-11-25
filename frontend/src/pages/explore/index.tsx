import React, { useState, useEffect, useRef } from "react";
import { useFetchPublicBuckets } from "@/hooks/buckets";
import { BucketCard } from "@/components/explore/BucketCard";
import { Bucket } from "@/types/bucket";
import { SearchInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import { formatText } from "@/lib/utils";
import { NewBucketModal } from "@/components/buckets/NewBucketModal";
import { useUser } from "@/context/UserContext";
import { SkeletonCard } from "@/components/utility/SkeletonCard";
import Link from "next/link";
import Head from "next/head";
import { PlusCircle } from "lucide-react";

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

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const title = query
    ? `Search Results for "${query}" - Spydr`
    : "explore - spydr";
  const description = query
    ? `Discover buckets matching your query "${query}".`
    : "Explore public buckets on Spydr. Find shared research and projects.";

  return (
    <div className="flex flex-1 flex-col gap-8 py-8 max-w-[1100px] mx-auto w-full">
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
      <div className="flex justify-around items-end lg:items-end px-4">
        <div className="max-w-[600px]">
          <Link href={"/"} className="cursor-pointer">
            <h1 className="text-4xl font-bold mb-2">
              <span className="hidden lg:block">
                For the questions without answers.
              </span>
            </h1>
            <h1 className="text-4xl font-bold mb-2 max-w-[200px]">
              <span className="block lg:hidden">
                Learn from the best.
              </span>
            </h1>
          </Link>
        </div>{" "}
        <div className="ml-auto flex items-end">
          {user ? (
            <NewBucketModal>
              <Button size="sm" className="h-8 gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="whitespace-nowrap">Create Bucket</span>
              </Button>
            </NewBucketModal>
          ) : (
            <Link href="/auth/login">
              <Button>Login/Register</Button>
            </Link>
          )}
        </div>
      </div>
      <div className="px-4">
        <SearchInput
          defaultValue={"whatever"}
          placeholder="Search for a bucket"
          onClick={() => setActive(true)}
          onChange={handleSearch}
          value={query}
        ></SearchInput>
      </div>
      <div className="w-full lg:min-h-[62vh]">
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
