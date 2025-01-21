import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchBuckets } from "@/hooks/buckets";
import { Bucket } from "@/types/bucket";
import { SearchInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { formatText } from "@/lib/utils";
import { debounce } from "lodash";

const SearchBar = ({
  onSearch,
  initialQuery = "",
}: {
  onSearch: (query: string, searchResults?: any) => void;
  initialQuery?: string;
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: searchResults, isLoading } = useSearchBuckets(debouncedQuery, {
    visibility: "Public",
  });

  const debouncedSetQuery = useCallback(
    debounce((value: string) => {
      setDebouncedQuery(value);
    }, 300),
    []
  );

  useEffect(() => {
    const savedSearches = localStorage.getItem("recentSearches");
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchActive(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    const updatedSearches = [
      searchQuery,
      ...recentSearches.filter((s) => s !== searchQuery),
    ].slice(0, 5);

    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));

    onSearch(searchQuery, searchResults);
    setIsSearchActive(false);
  };

  const removeRecentSearch = (searchQuery: string) => {
    const updatedSearches = recentSearches.filter((s) => s !== searchQuery);
    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSetQuery(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      handleSearch(query);
    }
  };

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative">
        <SearchInput
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsSearchActive(true)}
          placeholder="Search for buckets..."
          className="w-full py-3 px-6 caret-violet-500"
        />
      </div>

      {isSearchActive && (
        <div className="absolute w-full mt-2 bg-muted rounded-lg shadow-lg border p-4 z-50">
          {recentSearches.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-2">Recent searches</h3>
              <div className="flex flex-wrap whitespace-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-full py-1 pl-4 pr-1 cursor-pointer"
                  >
                    <span
                      onClick={() => {
                        setQuery(search);
                        handleSearch(search);
                      }}
                      className="flex-1 text-sm"
                    >
                      {search}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full py-2 px-2 w-fit h-fit"
                      onClick={() => removeRecentSearch(search)}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {debouncedQuery && searchResults && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Suggestions</h3>
              {searchResults.slice(0, 5).map((bucket: Bucket) => (
                <div
                  key={bucket.bucketId}
                  className="flex items-center py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-2 cursor-pointer"
                  onClick={() => handleSearch(bucket.name)}
                >
                  <span>{formatText(bucket.name, 80)}</span>
                </div>
              ))}
            </div>
          )}

          {isLoading && (
            <div className="py-4 text-center text-foreground">Searching...</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
