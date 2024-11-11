import React, { useState, useEffect, useRef } from "react";
import { useFetchPublicBuckets } from "@/hooks/buckets";
import { BucketCard } from "@/components/explore/BucketCard";
import { Bucket } from "@/types/bucket";
import { SearchInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { PlusCircle, File, ListFilter } from "lucide-react";
import { useRouter } from "next/router";
import { formatText } from "@/lib/utils";
import { NewBucketModal } from "@/components/buckets/NewBucketModal";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonCard } from "@/components/utility/SkeletonCard";

function Index() {
  const { buckets, loading, error } = useFetchPublicBuckets();
  const [query, setQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [active, setActive] = useState<boolean>(false);
  const searchInputWrapperRef = useRef<any>(null);
  const bucketsPerPage = 12;
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

  return (
    <div className="max-w-[1200px] w-full mx-auto flex flex-col gap-8 p-8">
      <div className="flex justify-between">
        <div>
          <h1 className="text-4xl font-extrabold">Explore Buckets</h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <ListFilter className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Filter
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked>
                Active
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Draft</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Archived</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" variant="outline" className="h-8 gap-1">
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Export
            </span>
          </Button>
          <NewBucketModal />
        </div>
      </div>

      <SearchInput
        defaultValue={"whatever"}
        placeholder="Search for a bucket"
        onClick={() => setActive(true)}
        onChange={handleSearch}
        value={query}
      ></SearchInput>

      <div className="w-full lg:min-h-[62vh]">
        {loading ? (
          <div className="w-full flex flex-wrap gap-10">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : error ? (
          <p>Error loading buckets</p>
        ) : currentBuckets.length > 0 ? (
          <div className="w-full flex flex-wrap gap-10">
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
          <p>No buckets found</p>
        )}
      </div>

      <div className="flex justify-between items-center mt-4">
        <p>
          {currentBuckets.length > 0
            ? `Showing ${indexOfFirstBucket + 1} - ${Math.min(
                indexOfLastBucket,
                filteredBuckets.length
              )} of ${filteredBuckets.length} results`
            : "0 results"}
        </p>
        <div className="flex gap-2">
          <Button onClick={handlePreviousPage} disabled={currentPage === 1}>
            Previous
          </Button>
          <Button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Index;
