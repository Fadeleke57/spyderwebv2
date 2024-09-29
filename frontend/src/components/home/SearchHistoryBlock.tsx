import React from "react";
import Link from "next/link";
import { useFetchSearchHistory } from "@/hooks/user";
import { useClearSearchHistory } from "@/hooks/user";
import { Ellipsis } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "../ui/scroll-area";

function SearchHistoryBlock() {
  const { searchHistory, loading, error, refetch } = useFetchSearchHistory();
  const { clearSearchHistory } = useClearSearchHistory();

  //remove duplicate queries
  const uniqueSearchHistory = searchHistory
    ?.filter((value, index, self) => {
      return index === self.findIndex((t) => t.query === value.query);
    })
    .slice(0, 20);

  const handleClearSearchHistory = async () => {
    await clearSearchHistory();
    await refetch();
  };

  return (
    <ScrollArea className="relative p-6 pt-14 w-full rounded-md inline-flex justify-start flex-wrap gap-2 border h-80 overflow-y-auto">
      <Popover>
        <PopoverTrigger className="absolute top-4 right-6 cursor-pointer">
          <Ellipsis className="text-slate-500 absolute top-1 right-1 cursor-pointer" />
        </PopoverTrigger>
        <PopoverContent
          className="mt-10 w-40 text-red-500 cursor-pointer"
          onClick={handleClearSearchHistory}
        >
          Clear History
        </PopoverContent>
      </Popover>
      <div className="w-full h-fit rounded-md inline-flex justify-start flex-wrap gap-2"> {/*The bottom border of this div should have a blur effect*/}
        {uniqueSearchHistory ? (
          uniqueSearchHistory.map((search, index) => (
            <Link
              href={{
                pathname: "/terminal",
                query: { query: search.query },
              }}
              key={index}
              className="p-1.5 px-3 decoration-none hover:text-slate-700 h-auto rounded-2xl bg-slate-100 hover:bg-slate-200"
            >
              <small className="text-sm font-medium leading-none">
                {search.query}
              </small>
            </Link>
          ))
        ) : (
          <p>No recent searches</p>
        )}
      </div> 
    </ScrollArea>
  );
}

export default SearchHistoryBlock;
