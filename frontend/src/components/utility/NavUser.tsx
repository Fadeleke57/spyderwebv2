"use client";

import {
  BadgeCheck,
  ChevronsUpDown,
  LogOut,
  Settings,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useUser } from "@/context/UserContext";
import Router, { useRouter } from "next/router";
import { Button } from "../ui/button";
import { AuthModal } from "../auth/AuthModal";
import { useState } from "react";
export function NavUser() {
  const { isMobile } = useSidebar();
  const [open, setOpen] = useState(false);
  const { user, logout } = useUser();
  const router = useRouter();

  const handleLogin = () => {
    setOpen(true);
  };

  if (!user) {
    return (
      <div className="flex flex-col gap-2 w-full">
        <Button onClick={handleLogin} className="w-full">
          Login
        </Button>
        <Button onClick={handleLogin} variant={"secondary"} className="w-full">
          Sign Up
        </Button>
        {open && <AuthModal type="login" referrer="nav" open={open} setOpen={setOpen} />}
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push("/explore");
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" isActive={false}>
              <Avatar className="h-8 w-8 rounded-full dark:bg-muted">
                <AvatarImage
                  src={`https://robohash.org/${user.id}?size=300x300`}
                  alt={user.full_name}
                />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.username}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={`https://robohash.org/${user.id}?size=300x300`}
                    alt={user.full_name}
                  />
                  <AvatarFallback className="rounded-lg">SP</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {user.username}
                  </span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="flex flex-row items-center gap-2 cursor-pointer"
                onClick={() => router.push("/settings?tab=account")}
              >
                <BadgeCheck size={16} />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex flex-row items-center gap-2 cursor-pointer"
                onClick={() => router.push("/settings")}
              >
                <Settings size={16} />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex flex-row items-center gap-2 cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="text-red-500" size={16} />
              <span className="text-red-500">Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
