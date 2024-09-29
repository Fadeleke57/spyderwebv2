"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Settings } from "lucide-react";
import { User } from "next-auth";
import { useUser } from "@/context/UserContext";
import { ChevronDown } from "lucide-react";
import { LogOut } from "lucide-react";
import { LayoutGrid } from "lucide-react";
import { useRouter } from "next/router";

export function UserDropDown({
  user,
  logout,
}: {
  user: User;
  logout: () => void;
}) {
  const router = useRouter();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {user.full_name}
          <ChevronDown size={16} className="ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48 pt-3">
        <DropdownMenuLabel className="font-semibold">
          {user.full_name}
        </DropdownMenuLabel>
        <DropdownMenuLabel className="mb-3">{user.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/terminal")}>
          <LayoutGrid className="mr-2 h-4 w-4" />
          <span>Home</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => logout()}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
