import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

export const ScrollAreaWithBlur = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const [showBottomBlur, setShowBottomBlur] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = () => {
    if (scrollAreaRef.current) {
      // Access the actual scrollable DOM element inside the ScrollArea component
      const scrollableElement = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );

      if (scrollableElement) {
        const { scrollTop, scrollHeight, clientHeight } = scrollableElement;
        // Check if we're at the bottom of the scroll area
        const isAtBottom =
          Math.abs(scrollHeight - clientHeight - scrollTop) < 10;
        setShowBottomBlur(!isAtBottom);
      }
    }
  };

  useEffect(() => {
    const containerElement = scrollAreaRef.current;
    if (containerElement) {
      // Find the scrollable element inside the ScrollArea
      const scrollableElement = containerElement.querySelector(
        "[data-radix-scroll-area-viewport]"
      );

      if (scrollableElement) {
        scrollableElement.addEventListener("scroll", handleScroll);
        // Initial check
        handleScroll();

        return () => {
          scrollableElement.removeEventListener("scroll", handleScroll);
        };
      }
    }
  }, []);

  return (
    <div className="relative rounded-b-lg" ref={scrollAreaRef}>
      <ScrollArea className={className || ""}>{children}</ScrollArea>

      <div
        className={`absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-muted to-transparent pointer-events-none transition-opacity duration-300 ease-in-out ${
          showBottomBlur ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
};
