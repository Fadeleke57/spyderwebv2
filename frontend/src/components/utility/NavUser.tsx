"use client";

import { BadgeCheck, Ellipsis, LogOut, Settings } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/ui/sidebar";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/router";
import { Button } from "../ui/button";
import { AuthModal } from "../auth/AuthModal";
import { useState } from "react";
import UserAvatar from "./UserAvatar";

export function NavUser() {
  const { isMobile, state } = useSidebar();
  const [open, setOpen] = useState(false);
  const { user, handleLogout } = useUser();
  const isCollapsed = state === "collapsed";
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
        <Button
          onClick={handleLogin}
          className="w-full border dark:bg-violet-400/40 dark:border-violet-200 dark:hover:bg-violet-400/60"
        >
          Sign Up
        </Button>
        {open && <AuthModal open={open} setOpen={setOpen} />}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className={`${isCollapsed && "ml-1"}`}>
        <div
          className={`flex items-center gap-2 px-1 py-1.5 text-left text-sm cursor-pointer ${!isCollapsed && "hover:bg-muted rounded-lg"}`}
        >
          <UserAvatar
            userId={user.id}
            dimension={isCollapsed ? 30 : 40}
            className={`${isCollapsed && "-ml-[8.5px]"}`}
          />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">
              {user.full_name || user.username}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {user.email}
            </span>
          </div>
          <Ellipsis className={`ml-auto size-4 ${isCollapsed && "hidden"}`} />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        side={isMobile ? "bottom" : "right"}
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <UserAvatar deactive userId={user.id} dimension={35} />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">
                {user.full_name || user.username}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                @{user.username}
              </span>
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
            onClick={() => router.push("/settings?tab=profile")}
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
  );
}
