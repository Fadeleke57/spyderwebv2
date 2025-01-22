import React, { useRef, useState, useEffect, useCallback } from "react";
import { SearchInput } from "../ui/input";
import { useSearchBuckets } from "@/hooks/buckets";
import { useUser } from "@/context/UserContext";
import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useOnClickOutside } from "@/hooks/general";
import { formatText } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

function UserBucketSearch() {
  const { user } = useUser();
  const [query, setQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useOnClickOutside(searchRef, () => setIsSearchActive(false));

  const { data: searchResults, isLoading } = useSearchBuckets(debouncedQuery, {
    userId: user?.id,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <div
      ref={searchRef}
      className="md:w-[200px] lg:w-[336px] w-flex items-center"
    >
      <div className="relative">
        <SearchInput
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsSearchActive(true)}
          placeholder="Search for buckets..."
          className="w-full py-3 px-6 caret-violet-500"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {isSearchActive && (
        <div className="absolute top-full z-50 mt-2 w-fit rounded-lg border bg-background p-2 shadow-lg min-w-full">
          {searchResults && searchResults.length > 0 ? (
            <div className="space-y-1">
              {searchResults.map((bucket: any) => (
                <Link
                  key={bucket.id}
                  href={`/buckets/bucket/${bucket.id}`}
                  className="block"
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left items-start text-sm flex flex-col h-fit dark:hover:muted"
                  >
                    {formatText(bucket.name, isMobile ? 40 : 55)}
                    <span className="text-muted-foreground">
                      {formatText(bucket.description, isMobile ? 40 : 55)}
                    </span>
                  </Button>
                </Link>
              ))}
            </div>
          ) : (
            query &&
            !isLoading && (
              <p className="p-2 text-sm text-muted-foreground">
                No buckets found
              </p>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default UserBucketSearch;
