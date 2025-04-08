//explore
import React, { useState, useEffect } from "react";
import { useFetchPublicWebs, useSearchWebs } from "@/hooks/webs";
import { WebCard } from "@/components/explore/WebCard";
import { Web } from "@/types/web";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import { useUser } from "@/context/UserContext";
import Head from "next/head";
import useMediaQuery from "@/hooks/general";
import { AuthModal } from "@/components/auth/AuthModal";
import SearchBar from "@/components/utility/Searchbar";
import { Loader } from "lucide-react";
import PopularWebsCard from "@/components/explore/PopularWebsCard";
import SpydrAI from "@/components/utility/Assistant";
import ExplorePageErrorCard from "@/components/utility/ExplorePageErrorCard";
import { ScrollArea } from "@/components/ui/scroll-area";

function Index() {
  const { ref, inView } = useInView();
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFetchPublicWebs();
  const [query, setQuery] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const { user } = useUser();

  const { data: searchResults, isLoading: isSearchLoading } = useSearchWebs(
    query,
    { visibility: "Public" }
  );

  useEffect(() => {
    if (inView && hasNextPage && !query) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage, query]);

  const allWebs = data?.pages.flatMap((page) => page.result) || [];
  const displayWebs = query ? searchResults || [] : allWebs;

  const isMobile = useMediaQuery("(max-width: 768px)");

  const title = query
    ? `Search Results for "${query}" - spydr`
    : "explore - spydr";
  const description = query
    ? `Discover webs matching your query "${query}".`
    : "Explore public webs on Spydr. Find shared research and projects.";

  const handleSearch = (searchQuery: string, results: any) => {
    setQuery(searchQuery);
  };

  return (
    <div>
      <ScrollArea className="flex flex-1 flex-col gap-4 w-full lg:h-[calc(108.9vh-64px)] relative">
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
        <div></div>
        <div className="p-4 lg:px-16 border-b-2 relative lg:sticky lg:top-0 bg-background lg:z-50 -ml-2">
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
        <div className="w-full h-full lg:px-16 pt-2 pb-10 flex flex-row gap-6 relative">
          <div className="w-full flex flex-col lg:gap-1">
            {error && <ExplorePageErrorCard />}
            {isLoading ? (
              <Loader className="animate-spin mx-auto" />
            ) : (
              displayWebs.map((web: Web) => (
                <div key={web.webId} className="cursor-pointer">
                  <WebCard user={user || null} web={web} />
                </div>
              ))
            )}

            <div ref={ref} className="h-10 w-full">
              {isFetchingNextPage && (
                <div className="w-full flex flex-col items-center justify-center gap-3">
                  <Loader className="animate-spin" />
                </div>
              )}
            </div>
          </div>
          <PopularWebsCard />
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
      </ScrollArea>
    </div>
  );
}

export default Index;
