import { useState, useEffect } from "react";
import { useFetchPublicWebs, useSearchWebs } from "@/hooks/webs";
import { WebCard } from "@/components/explore/WebCard";
import { Web } from "@/types/web";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import Head from "next/head";
import useMediaQuery from "@/hooks/general";
import { AuthModal } from "@/components/auth/AuthModal";
import SearchBar from "@/components/utility/Searchbar";
import { Loader } from "lucide-react";
import PopularWebsCard from "@/components/explore/PopularWebsCard";
import ExplorePageErrorCard from "@/components/utility/ExplorePageErrorCard";
import { useRouter } from "next/router";
import { SearchResultCard } from "@/components/explore/SearchResult";

function SearchPage() {
  const { ref, inView } = useInView();
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFetchPublicWebs();

  const [open, setOpen] = useState(false);
  const { user } = useUser();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const router = useRouter();
  const { query: searchQueryParam } = router.query;
  const [query, setQuery] = useState<string>(
    (searchQueryParam as string) || ""
  );

  useEffect(() => {
    if (searchQueryParam) {
      setQuery(searchQueryParam as string);
    }
  }, [searchQueryParam]);

  const { data: searchResults, isLoading: isSearchLoading } = useSearchWebs(
    query,
    {
      visibility: "Public",
    }
  );

  useEffect(() => {
    if (inView && hasNextPage && !query) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage, query]);

  const allWebs = data?.pages.flatMap((page) => page.result) || [];
  const displayWebs: Web[] = query ? searchResults || [] : allWebs;

  const title = query
    ? `Search Results for "${query}" - spydr`
    : "explore - spydr";
  const description = query
    ? `Discover webs matching your query "${query}".`
    : "Explore public webs on Spydr. Find shared research and projects.";

  const handleSearch = (q: string) => setQuery(q);

  return (
    <div className="lg:h-screen flex flex-col overflow-hidden">
      <div className="flex flex-1 flex-col gap-4 w-full relative overflow-y-auto">
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

        <div className="p-4 flex flex-col lg:px-8 relative lg:sticky lg:top-0 z-[25] flex justify-end bg-background/60 border-zinc-800 backdrop-blur-md">
          {!user && isMobile && (
            <>
              <Button
                className="w-full mb-2"
                variant="secondary"
                onClick={() => setOpen(true)}
              >
                Sign Up
              </Button>
              <Button className="w-full mb-4" onClick={() => setOpen(true)}>
                Login
              </Button>
            </>
          )}
          <SearchBar onSearch={handleSearch} initialQuery={query} />
        </div>

        <div className="w-full lg:px-8 pb-10 flex flex-row gap-6 relative">
          <div className="w-full flex flex-col lg:gap-1">
            {error && <ExplorePageErrorCard />}
            {isLoading || isSearchLoading ? (
              <Loader className="animate-spin mx-auto my-16" />
            ) : displayWebs.length > 0 ? (
              displayWebs.map((web: Web) => (
                <div key={web.webId} className="cursor-pointer">
                  {query ? (
                    <SearchResultCard webId={web.webId} />
                  ) : (
                    <WebCard user={user || null} web={web} />
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground mt-16">
                {query
                  ? `No webs found for "${query}".`
                  : "No public webs available."}
              </p>
            )}

            {!query && (
              <div ref={ref} className="h-10 w-full">
                {isFetchingNextPage && (
                  <div className="w-full flex flex-col items-center justify-center gap-3">
                    <Loader className="animate-spin" />
                  </div>
                )}
              </div>
            )}
          </div>
          <PopularWebsCard />
        </div>

        {open && (
          <AuthModal
            open={open}
            setOpen={setOpen}
          />
        )}
      </div>
    </div>
  );
}

export default SearchPage;
