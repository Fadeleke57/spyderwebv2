"use client";

import * as React from "react";
import { useUser } from "@/context/UserContext";
import slogo from "@/assets/s_logo.jpg";
import { NavUser } from "@/components/utility/NavUser";
import { TeamSwitcher } from "@/components/utility/TeamSwitcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  CirclePlus,
  Home,
  LayoutGrid,
  Link2,
  PaintBucket,
  Settings,
} from "lucide-react";
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();

  const handleOpenSettingsModal = () => {};

  return (
    <Sidebar collapsible="icon" {...props} className="flex justify-center">
      <SidebarHeader>
        <div className="flex items-center justify-between">
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
            onClick={() => router.push("/")}
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
              <Image src={slogo} alt="logo" width={36} height={36} className="rounded-lg" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">spydr</span>
            </div>
          </SidebarMenuButton>
          <SidebarTrigger hideWhen="collapsed" />
        </div>
      </SidebarHeader>
      <SidebarContent className="flex flex-col gap-6 mt-8 px-2">
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          onClick={() => router.push("/home")}
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-500 text-sidebar-primary-foreground">
            <Home className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Home</span>
            <span className="truncate text-xs">View Buckets</span>
          </div>
        </SidebarMenuButton>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          onClick={() => router.push("/explore")}
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-500 text-sidebar-primary-foreground">
            <LayoutGrid className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Explore</span>
            <span className="truncate text-xs">View Other Buckets</span>
          </div>
        </SidebarMenuButton>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          onClick={() => router.push("/buckets")}
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-500 text-sidebar-primary-foreground">
            <CirclePlus className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Create</span>
            <span className="truncate text-xs">Create a New Bucket</span>
          </div>
        </SidebarMenuButton>
        <div className="mt-auto">
          <SidebarTrigger orientation="right" hideWhen="expanded" />
        </div>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
