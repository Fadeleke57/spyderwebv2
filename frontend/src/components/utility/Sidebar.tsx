import React, { useState } from "react";
import Link from "next/link";
import {
  Aperture,
  Home,
  LayoutGrid,
  PaintBucket,
  Search,
  Settings,
  Waypoints,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRouter } from "next/router";

export default function Sidebar() {
  const [active, setActive] = useState<number | null>(null);
  const [isSearchModalOpen, setSearchModalOpen] = useState(false);
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  const router = useRouter();

  const handleOpenSettingsModal = () => {
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild onClick={() => setActive(1)}>
              <Link
                href="/home"
                className={`group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full text-lg font-semibold ${
                  active === 1
                    ? "bg-primary text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-primary"
                } md:h-8 md:w-8 md:text-base`}
                
              >
                <Home className="h-5 w-5 transition-all group-hover:scale-110" />
                <span className="sr-only">Home</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Home</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild onClick={() => setActive(2)}>
              <button
                className={`group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full text-lg font-semibold ${
                  active === 2
                    ? "bg-primary text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-primary"
                } md:h-8 md:w-8 md:text-base`}
                onClick={() => router.push("/terminal")}
              >
                <Search className="h-5 w-5 transition-all group-hover:scale-110" />
                <span className="sr-only">Search</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Search</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild onClick={() => setActive(3)}>
              <Link
                href="/buckets"
                className={`group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full text-lg font-semibold ${
                  active === 3
                    ? "bg-primary text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-primary"
                } md:h-8 md:w-8 md:text-base`}
                
              >
                <PaintBucket className="h-5 w-5 transition-all group-hover:scale-110" />
                <span className="sr-only">Buckets</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Buckets</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild onClick={() => setActive(4)}>
              <Link
                href="/explore"
                className={`group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full text-lg font-semibold ${
                  active === 4
                    ? "bg-primary text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-primary"
                } md:h-8 md:w-8 md:text-base`}
                
              >
                <LayoutGrid className="h-5 w-5 transition-all group-hover:scale-110" />
                <span className="sr-only">Explore</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Explore</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </nav>

      <nav className="mt-auto flex flex-col items-center gap-5 px-2 sm:py-5">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild onClick={() => setActive(5)}>
              <button
                className={`group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full text-lg font-semibold ${
                  active === 5
                    ? "bg-primary text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-primary"
                } md:h-8 md:w-8 md:text-base`}
                onClick={handleOpenSettingsModal}
              >
                <Settings className="h-5 w-5 transition-all group-hover:scale-110" />
                <span className="sr-only">Settings</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </nav>
    </aside>
  );
}
