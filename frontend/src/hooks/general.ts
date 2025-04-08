import { useState, useEffect, useRef } from "react";
import { RefObject } from "react";

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia(query).matches;
    }
    return false;
  });
  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handleChange = () => setMatches(mediaQuery.matches);
    setMatches(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
}

type Event = MouseEvent | TouchEvent;

export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: (event: Event) => void,
  mouseEvent: "mousedown" | "mouseup" = "mousedown"
): void {
  useEffect(() => {
    const listener = (event: Event) => {
      const el = ref?.current;
      if (!el || el.contains((event?.target as Node) || null)) {
        return;
      }

      handler(event);
    };

    document.addEventListener(mouseEvent, listener);
    document.addEventListener("touchend", listener);

    return () => {
      document.removeEventListener(mouseEvent, listener);
      document.removeEventListener("touchend", listener);
    };
  }, [ref, handler, mouseEvent]);
}

export function useScrollToBottom<T extends HTMLElement>(
  dependencies: any[] = [],
  isStreaming: boolean = false
): [RefObject<T>, RefObject<T>] {
  const containerRef = useRef<T>(null);
  const endRef = useRef<T>(null);
  const userScrolledRef = useRef(false);
  const isStreamingRef = useRef(isStreaming);

  // Update the streaming ref when the prop changes
  useEffect(() => {
    isStreamingRef.current = isStreaming;
  }, [isStreaming]);

  useEffect(() => {
    const container = containerRef.current;
    const end = endRef.current;

    if (!container || !end) return;

    // Detect when user manually scrolls
    const handleScroll = () => {
      if (!container) return;

      const { scrollTop, scrollHeight, clientHeight } = container;
      // If we're not at the bottom, user has scrolled up
      const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 10;

      // Only consider it a manual scroll if we're not currently streaming
      if (!isStreamingRef.current) {
        userScrolledRef.current = !isAtBottom;
      }
    };

    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Handle scrolling on message changes
  useEffect(() => {
    const end = endRef.current;

    if (!end) return;

    // Scroll if user hasn't manually scrolled up OR if we're currently streaming
    if (!userScrolledRef.current || isStreaming) {
      end.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [...dependencies, isStreaming]);

  // Set up an interval to scroll while streaming
  useEffect(() => {
    if (!isStreaming) return;

    // Reset user scrolled state when streaming starts
    userScrolledRef.current = false;

    const end = endRef.current;
    if (!end) return;

    // Initial scroll when streaming starts
    end.scrollIntoView({ behavior: "smooth", block: "end" });

    // Set up interval to scroll periodically during streaming
    const intervalId = setInterval(() => {
      if (isStreamingRef.current && end) {
        end.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    }, 100);

    return () => clearInterval(intervalId);
  }, [isStreaming]);

  return [containerRef, endRef];
}


export default useMediaQuery;
