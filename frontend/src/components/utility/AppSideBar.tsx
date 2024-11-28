"use client";

import * as React from "react";
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
import { Button } from "../ui/button";
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const { user } = useUser();

  const handleOpenSettingsModal = () => {};

  return (
    <Sidebar collapsible="icon" {...props} className="flex justify-center">
      <SidebarHeader>
        <div className="flex items-center justify-between rounded-full">
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
              />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold text-3xl text-black tracking-tighter">
                spydr
              </span>
            </div>
          </SidebarMenuButton>
          <SidebarTrigger hideWhen="collapsed" />
        </div>
      </SidebarHeader>
      <SidebarContent className="flex flex-col mt-8 px-2">
        <SidebarMenuButton
          size="sm"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          onClick={() => router.push("/home")}
        >
          <div className="flex flex-row gap-2 items-center rounded-lg bg-none text-slate-500 text-sidebar-primary-foreground">
            <Home className="size-5" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate  text-lg text-slate-500">Home</span>
          </div>
        </SidebarMenuButton>
        <SidebarMenuButton
          size="sm"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          onClick={() => router.push("/explore")}
        >
          <div className="flex flex-row gap-2 items-center rounded-lg bg-none text-slate-500 text-sidebar-primary-foreground">
            <LayoutGrid className="size-5" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate  text-lg text-slate-500">Explore</span>
          </div>
        </SidebarMenuButton>
        <SidebarMenuButton
          size="sm"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          onClick={() => router.push("/buckets")}
        >
          <div className="flex flex-row gap-2 items-center rounded-lg bg-none text-slate-500 text-sidebar-primary-foreground">
            <ChartNoAxesGantt className="size-5" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate  text-lg text-slate-500">Buckets</span>
          </div>
        </SidebarMenuButton>
        <SidebarMenuButton
          size="sm"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div>
            <NewBucketModal>
              <Button className="w-full bg-transparent hover:bg-transparent p-0 flex flex-row gap-2">
                <div className="flex items-center rounded-lg bg-none text-slate-500 text-sidebar-primary-foreground">
                  <CirclePlus className="size-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate  text-lg text-slate-500">Create</span>
                </div>
              </Button>
            </NewBucketModal>
          </div>
        </SidebarMenuButton>
        <div className="mt-auto">
          <SidebarTrigger orientation="right" hideWhen="expanded" />
        </div>
      </SidebarContent>
      <SidebarFooter hideWhen={user ? null : "collapsed"} className="mb-8">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
