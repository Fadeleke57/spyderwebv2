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

export function useScrollToBottom<T extends HTMLElement>(): [
  RefObject<T>,
  RefObject<T>,
] {
  const containerRef = useRef<T>(null);
  const endRef = useRef<T>(null);

  useEffect(() => {
    const container = containerRef.current;
    const end = endRef.current;

    if (container && end) {
      const observer = new MutationObserver(() => {
        end.scrollIntoView({ behavior: "auto", block: "end" });
      });

      observer.observe(container, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
      });

      return () => observer.disconnect();
    }
  }, []);

  return [containerRef, endRef];
}


export default useMediaQuery;
