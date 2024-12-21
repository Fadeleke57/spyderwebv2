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
} from "@/components/ui/sidebar";
import Image from "next/image";
import { useRouter } from "next/router";
import { ChartNoAxesGantt, CirclePlus, Home, LayoutGrid } from "lucide-react";
import { NewBucketModal } from "../buckets/NewBucketModal";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const { user } = useUser();
  const [selectedButton, setSelectedButton] = useState<string | null>(null);

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

  const handleOpenSettingsModal = () => {};

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
                <span className="truncate font-semibold text-3xl text-black tracking-tighter">
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
            className={`data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground rounded-none`}
            onClick={() => router.push("/home")}
          >
            <div
              className={`flex flex-row gap-2 items-center rounded-lg bg-none text-blue-950 text-sidebar-primary-foreground`}
            >
              <Home
                className={`size-5 ${
                  selectedButton === "home"
                    ? "text-blue-950"
                    : "text-slate-500"
                }`}
              />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span
                className={`truncate text-lg ${
                  selectedButton === "home" ? "text-blue-950" : "text-slate-500"
                }`}
              >
                Home
              </span>
            </div>
          </SidebarMenuButton>
          {selectedButton === "home" && (
            <div className="absolute top-0 -right-1 z-[100] h-full w-2 bg-blue-950 rounded-l-sm"></div>
          )}
        </div>
        <div className="relative px-2">
          <SidebarMenuButton
            size="sm"
            className={`data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground rounded-none`}
            onClick={() => router.push("/explore")}
          >
            <div
              className={`flex flex-row gap-2 items-center rounded-lg bg-none text-blue-950 text-sidebar-primary-foreground`}
            >
              <LayoutGrid
                className={`size-5 ${
                  selectedButton === "explore"
                    ? "text-blue-950"
                    : "text-slate-500"
                }`}
              />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span
                className={`truncate text-lg ${
                  selectedButton === "explore"
                    ? "text-blue-950"
                    : "text-slate-500"
                }`}
              >
                Explore
              </span>
            </div>
          </SidebarMenuButton>
          {selectedButton === "explore" && (
            <div className="absolute top-0 -right-1 z-[100] h-full w-2 bg-blue-950 rounded-l-sm"></div>
          )}
        </div>
        <div className="relative px-2">
          <SidebarMenuButton
            size="sm"
            className={`data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground rounded-none`}
            onClick={() => router.push("/buckets")}
          >
            <div
              className={`flex flex-row gap-2 items-center rounded-lg bg-none text-blue-950 text-sidebar-primary-foreground`}
            >
              <ChartNoAxesGantt
                className={`size-5 ${
                  selectedButton === "buckets"
                    ? "text-blue-950"
                    : "text-slate-500"
                }`}
              />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span
                className={`truncate text-lg ${
                  selectedButton === "buckets"
                    ? "text-blue-950"
                    : "text-slate-500"
                }`}
              >
                Buckets
              </span>
            </div>
          </SidebarMenuButton>
          {selectedButton === "buckets" && (
            <div className="absolute top-0 -right-1 z-[100] h-full w-2 bg-blue-950 rounded-l-sm"></div>
          )}
        </div>
        <NewBucketModal>
          <div className="px-2">
            <SidebarMenuButton
              size="sm"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground rounded-none px-2"
            >
              <div className="w-full bg-transparent hover:bg-transparent p-0 flex flex-row gap-2">
                <div className="flex items-center rounded-lg bg-none text-slate-500 text-sidebar-primary-foreground">
                  <CirclePlus className="size-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate text-lg text-slate-500">
                    Create
                  </span>
                </div>
              </div>
              <div className="flex flex-row gap-2">
                <span className="bg-slate-200 text-md h-fit p-2 rounded-md font-bold">
                  ⌘
                </span>
                <span className="bg-slate-200 text-md h-fit p-2 rounded-md font-bold">
                  X
                </span>
              </div>
            </SidebarMenuButton>
          </div>
        </NewBucketModal>
        <div className="mt-auto px-2">
          <SidebarTrigger orientation="right" hideWhen="expanded" />
        </div>
      </SidebarContent>
      <SidebarFooter hideWhen={user ? null : "collapsed"} className="mb-8">
        <NavUser />
      </SidebarFooter>
      <SidebarRail></SidebarRail>
    </Sidebar>
  );
}
