"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import slogo from "@/assets/slogonobg.png";
import { NavUser } from "@/components/utility/NavUser";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { useRouter } from "next/router";
import { CirclePlus, Home, LayoutGrid, Waypoints } from "lucide-react";
import { NewWebModal } from "../webs/NewWebModal";
import { AuthModal } from "../auth/AuthModal";
import { ResourceUsage } from "./ResourceUsage";
import { useResourceUsage } from "@/hooks/usage";
import { Skeleton } from "../ui/skeleton";

const SidebarIndicator = ({ show }: { show: boolean }) => {
  const { state } = useSidebar();
  if (state === "collapsed" || !show) return null;

  return (
    <div className="absolute top-0 -right-1 z-[100] h-full w-2 bg-slate-600 dark:bg-foreground rounded-l-sm" />
  );
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const { user } = useUser();
  const [selectedButton, setSelectedButton] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const {
    data: usage,
    isLoading: usageLoading,
    isError: usageError,
  } = useResourceUsage(user?.id);

  useEffect(() => {
    if (router.pathname.startsWith("/home")) {
      setSelectedButton("home");
    } else if (router.pathname.startsWith("/explore")) {
      setSelectedButton("explore");
    } else if (router.pathname.startsWith("/webs")) {
      setSelectedButton("webs");
    } else {
      setSelectedButton(null);
    }
  }, [router.pathname]);

  const handleButtonClick = (route: string) => {
    if (!user) {
      setOpen(true);
      return;
    }

    router.push(route);
  };

  return (
    <Sidebar
      collapsible="icon"
      {...props}
      className="flex justify-center p-0 border-l-none h-screen"
    >
      <SidebarHeader>
        <div className="flex flex-col items-end justify-center">
          <div className="w-full flex items-center justify-between rounded-full">
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer rounded-full flex flex-row gap-2 items-center"
              onClick={() => router.push("/explore")}
              deactive
            >
              <div className="flex flex-row aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground rounded-full">
                <Image
                  src={slogo}
                  alt="logo"
                  width={36}
                  height={36}
                  className="rounded-full"
                  priority
                />
              </div>
              <div className="flex-1 text-left text-sm leading-tight flex items-start border-red">
                <span className="-mt-1 truncate font-semibold text-3xl text-black dark:text-foreground tracking-tighter">
                  spydr
                </span>
              </div>
            </SidebarMenuButton>
            <SidebarTrigger hideWhen="collapsed"></SidebarTrigger>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="flex flex-col mt-8 overflow-hidden">
        <div className="relative px-2">
          <SidebarMenuButton
            size="sm"
            className={`data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground py-4 rounded-lg`}
            onClick={() => handleButtonClick("/home")}
          >
            <div
              className={`flex flex-row gap-2 items-center rounded-lg bg-none text-blue-950 text-sidebar-primary-foreground`}
            >
              <Home
                className={`size-5 ${
                  selectedButton === "home"
                    ? "text-muted-foreground dark:text-foreground font-semibold"
                    : "text-muted-foreground"
                }`}
              />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span
                className={`truncate text-xl ${
                  selectedButton === "home"
                    ? "text-muted-foreground dark:text-foreground font-semibold"
                    : "text-muted-foreground"
                }`}
              >
                Home
              </span>
            </div>
          </SidebarMenuButton>
          <SidebarIndicator show={selectedButton === "home"} />
        </div>
        <div className="relative px-2">
          <SidebarMenuButton
            size="sm"
            className={`data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground py-4 rounded-lg`}
            onClick={() => router.push("/explore")}
          >
            <div
              className={`flex flex-row gap-2 items-center rounded-lg bg-none text-blue-950 text-sidebar-primary-foreground`}
            >
              <LayoutGrid
                className={`size-5 ${
                  selectedButton === "explore"
                    ? "text-muted-foreground dark:text-foreground font-semibold"
                    : "text-muted-foreground"
                }`}
              />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span
                className={`truncate text-xl ${
                  selectedButton === "explore"
                    ? "text-muted-foreground dark:text-foreground font-semibold"
                    : "text-muted-foreground"
                }`}
              >
                Explore
              </span>
            </div>
          </SidebarMenuButton>
          <SidebarIndicator show={selectedButton === "explore"} />
        </div>
        <div className="relative px-2">
          <SidebarMenuButton
            size="sm"
            className={`data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground rounded-none  py-4 rounded-lg`}
            onClick={() => handleButtonClick("/webs")}
          >
            <div
              className={`flex flex-row gap-2 items-center rounded-lg bg-none text-sidebar-primary-foreground`}
            >
              <Waypoints
                className={`size-5 ${
                  selectedButton === "webs"
                    ? "text-muted-foreground dark:text-foreground font-semibold"
                    : "text-muted-foreground"
                }`}
              />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span
                className={`truncate text-xl ${
                  selectedButton === "webs"
                    ? "text-muted-foreground dark:text-foreground font-semibold"
                    : "text-muted-foreground"
                }`}
              >
                Webs
              </span>
            </div>
          </SidebarMenuButton>
          <SidebarIndicator show={selectedButton === "webs"} />
        </div>
        {/*
        <div className="relative px-2">
          <SidebarMenuButton
            size="sm"
            className={`data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground rounded-none  py-4 rounded-lg`}
            onClick={() => handleButtonClick("/chat")}
          >
            <div
              className={`flex flex-row gap-2 items-center rounded-lg bg-none text-sidebar-primary-foreground`}
            >
              <Brain
                className={`size-5 ${
                  selectedButton === "chat"
                    ? "text-muted-foreground dark:text-foreground font-semibold"
                    : "text-muted-foreground"
                }`}
              />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span
                className={`truncate text-xl ${
                  selectedButton === "chat"
                    ? "text-muted-foreground dark:text-foreground font-semibold"
                    : "text-muted-foreground"
                }`}
              >
                Charlotte AI
              </span>
            </div>
          </SidebarMenuButton>
          <SidebarIndicator show={selectedButton === "chat"} />
        </div>*/}
        {user ? (
          <NewWebModal>
            <div className="px-2">
              <SidebarMenuButton
                size="sm"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground rounded-none py-4 rounded-lg"
              >
                <div className="w-full bg-transparent hover:bg-transparent p-0 flex flex-row gap-2">
                  <div className="flex items-center rounded-lg bg-none text-muted-foreground">
                    <CirclePlus className="size-5" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate text-xl text-muted-foreground dark:text-muted-foreground">
                      Create
                    </span>
                  </div>
                </div>
                <div className="flex flex-row gap-1 items-center text-muted-foreground dark:text-muted-foreground">
                  <span className="foreground text-md rounded-lg font-bold flex items-center border p-1 px-[7px]">
                    ⌘
                  </span>
                  <span className="foreground text-md rounded-lg font-bold flex items-center border p-1 px-[7px]">
                    X
                  </span>
                </div>
              </SidebarMenuButton>
            </div>
          </NewWebModal>
        ) : (
          <div className="px-2">
            <SidebarMenuButton
              onClick={() => setOpen(true)}
              size="sm"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground rounded-none py-4 rounded-lg"
            >
              <div className="w-full bg-transparent hover:bg-transparent p-0 flex flex-row gap-2">
                <div className="flex items-center rounded-lg bg-none text-muted-foreground">
                  <CirclePlus className="size-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate text-xl text-muted-foreground dark:text-muted-foreground">
                    Create
                  </span>
                </div>
              </div>
            </SidebarMenuButton>
          </div>
        )}

        <div className="mt-auto px-2">
          <SidebarTrigger orientation="right" hideWhen="expanded" />
        </div>
      </SidebarContent>
      <SidebarFooter
        hideWhen={user ? null : "collapsed"}
        className="mb-2 relative"
      >
        {user && (
          <div className="px-2 mb-4">
            {usageLoading ? (
              <Skeleton className="h-32 w-full rounded-xl" />
            ) : (
              <ResourceUsage
                storageUsed={usage?.storage.used || 0}
                storageLimit={usage?.storage.limit || 0}
                computationUsed={usage?.computation.used || 0}
                computationLimit={usage?.computation.limit || 0}
              />
            )}
            {usageError && <div>Something went wrong</div>}
          </div>
        )}
        <NavUser />
      </SidebarFooter>
      {open && (
        <AuthModal
          type="login"
          referrer="sidebar"
          open={open}
          setOpen={setOpen}
        />
      )}
    </Sidebar>
  );
}
