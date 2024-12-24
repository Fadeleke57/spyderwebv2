import * as React from "react";
import { BucketTag, tagsList } from "@/types/bucket";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/router";

export function TagsScroll({
  activeTag,
  setActiveTag,
}: {
  activeTag: string | null;
  setActiveTag: any;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const router = useRouter();

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollLeft = container.scrollLeft;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;

    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScroll();

    const resizeObserver = new ResizeObserver(() => {
      checkScroll();
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.3;
    const newScrollPosition =
      container.scrollLeft +
      (direction === "left" ? -scrollAmount : scrollAmount);

    container.scrollTo({
      left: newScrollPosition,
      behavior: "smooth",
    });

    setTimeout(checkScroll, 100);
  };

  const handleScroll = () => {
    requestAnimationFrame(checkScroll);
  };

  const handleTagClick = (tag: string | null) => {
    if (tag === activeTag) {
      return;
    }
    if (tag === null) {
      router.push("/explore");
      setActiveTag(null);
      return;
    }
    router.push({
      pathname: "/explore",
      query: { tag: tag || undefined },
    });
    setActiveTag(tag);
  };

  return (
    <div className="relative w-full mt-4">
      {showLeftArrow && (
        <div className="absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-white via-white to-transparent">
          <Button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-transparent rounded-full p-2 hover:bg-slate-300 transition-all h-10 w-10 text-slate-900"
            aria-label="Scroll left"
          >
            <ChevronLeft strokeWidth={1.5} size={24} />
          </Button>
        </div>
      )}

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="w-full overflow-x-auto no-scrollbar"
      >
        <div className="flex gap-2 p-4 pl-0">
          <Button
            variant="secondary"
            className={`rounded-lg ${
              activeTag === null
                ? "bg-zinc-900 hover:bg-zinc-800 text-white"
                : "bg-zinc-100 hover:bg-zinc-200 text-zinc-900"
            } font-semibold mr-2 shrink-0`}
            onClick={() => handleTagClick(null)}
          >
            All
          </Button>
          {tagsList.map((tag: BucketTag) => (
            <Button
              key={tag.label}
              variant="secondary"
              className={`rounded-lg ${
                activeTag === tag.label
                  ? "bg-zinc-900 hover:bg-zinc-800 text-white"
                  : "bg-zinc-100 hover:bg-zinc-200 text-zinc-900"
              } font-semibold mr-2 shrink-0`}
              onClick={() => handleTagClick(tag.label)}
            >
              {tag.value}
            </Button>
          ))}
        </div>
      </div>

      {showRightArrow && (
        <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-white via-white to-transparent">
          <Button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-transparent rounded-full p-2 hover:bg-slate-300 transition-all h-10 w-10 text-slate-900"
            aria-label="Scroll right"
          >
            <ChevronRight strokeWidth={1.5} size={24} />
          </Button>
        </div>
      )}
    </div>
  );
}

export default TagsScroll;
