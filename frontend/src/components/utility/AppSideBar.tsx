"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import slogo from "@/assets/s_logo.jpg";
import { NavUser } from "@/components/utility/NavUser";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { useRouter } from "next/router";
import { ChartNoAxesGantt, CirclePlus, Home, LayoutGrid } from "lucide-react";
import { NewBucketModal } from "../buckets/NewBucketModal";
import { AuthModal } from "../auth/AuthModal";

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

  useEffect(() => {
    if (router.pathname.startsWith("/home")) {
      setSelectedButton("home");
    } else if (router.pathname.startsWith("/explore")) {
      setSelectedButton("explore");
    } else if (router.pathname.startsWith("/buckets")) {
      setSelectedButton("buckets");
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
    <Sidebar collapsible="icon" {...props} className="flex justify-center">
      <SidebarHeader>
        <div className="flex flex-col items-end justify-center">
          <div className="w-full flex items-center justify-between rounded-full">
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer rounded-full flex flex-row gap-2 items-center"
              onClick={() => router.push("/explore")}
              deactive
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground rounded-full">
                <Image
                  src={slogo}
                  alt="logo"
                  width={36}
                  height={36}
                  className="rounded-full"
                  priority
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-3xl text-black dark:text-foreground tracking-tighter">
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
            className={`data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground  py-4 rounded-md`}
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
                className={`truncate text-lg ${
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
            className={`data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground  py-4 rounded-md`}
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
                className={`truncate text-lg ${
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
            className={`data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground rounded-none  py-4 rounded-md`}
            onClick={() => handleButtonClick("/buckets")}
          >
            <div
              className={`flex flex-row gap-2 items-center rounded-lg bg-none text-sidebar-primary-foreground`}
            >
              <ChartNoAxesGantt
                className={`size-5 ${
                  selectedButton === "buckets"
                    ? "text-muted-foreground dark:text-foreground font-semibold"
                    : "text-muted-foreground"
                }`}
              />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span
                className={`truncate text-lg ${
                  selectedButton === "buckets"
                    ? "text-muted-foreground dark:text-foreground font-semibold"
                    : "text-muted-foreground"
                }`}
              >
                Buckets
              </span>
            </div>
          </SidebarMenuButton>
          <SidebarIndicator show={selectedButton === "buckets"} />
        </div>
        {user ? (
          <NewBucketModal>
            <div className="px-2">
              <SidebarMenuButton
                size="sm"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground rounded-none py-4 rounded-md"
              >
                <div className="w-full bg-transparent hover:bg-transparent p-0 flex flex-row gap-2">
                  <div className="flex items-center rounded-lg bg-none text-muted-foreground">
                    <CirclePlus className="size-5" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate text-lg text-muted-foreground dark:text-muted-foreground">
                      Create
                    </span>
                  </div>
                </div>
                <div className="flex flex-row gap-1 items-center text-muted-foreground dark:text-muted-foreground">
                  <span className="foreground text-md rounded-md font-bold flex items-center border p-1 px-[7px]">
                    ⌘
                  </span>
                  <span className="foreground text-md rounded-md font-bold flex items-center border p-1 px-[7px]">
                    X
                  </span>
                </div>
              </SidebarMenuButton>
            </div>
          </NewBucketModal>
        ) : (
          <div className="px-2">
            <SidebarMenuButton
              onClick={() => setOpen(true)}
              size="sm"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground rounded-none py-4 rounded-md"
            >
              <div className="w-full bg-transparent hover:bg-transparent p-0 flex flex-row gap-2">
                <div className="flex items-center rounded-lg bg-none text-muted-foreground">
                  <CirclePlus className="size-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate text-lg text-muted-foreground dark:text-muted-foreground">
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
        <NavUser />
      </SidebarFooter>
      <SidebarRail></SidebarRail>
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
