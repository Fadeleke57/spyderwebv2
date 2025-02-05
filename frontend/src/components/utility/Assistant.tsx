import React, { useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import UserBucketSearch from "@/components/buckets/UserBucketSearch";
import gsap from "gsap";

const NotionStyleSearch = () => {
  const searchPanelRef = useRef(null);

  const handleOpenChange = (open : boolean) => {
    if (open) {
      gsap.fromTo(
        searchPanelRef.current,
        {
          opacity: 0,
          y: 20,
          scale: 0.95,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.3,
          ease: "power2.out",
        }
      );
    }
  };

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 h-10 w-10 rounded-full p-0 shadow-lg"
          variant="default"
        >
          <Search className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="fixed bottom-8 h-fit max-w-2xl border-none p-0 shadow-none">
        <div ref={searchPanelRef}>
          <div className="overflow-hidden rounded-lg border bg-background shadow-lg">
            <div className="p-4">
              <UserBucketSearch />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotionStyleSearch;
