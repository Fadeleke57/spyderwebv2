"use client";

import * as React from "react";

import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Status = {
  value: string;
  label: string;
};

const statuses: Status[] = [
  {
    value: "backlog",
    label: "Backlog",
  },
  {
    value: "todo",
    label: "Todo",
  },
  {
    value: "in progress",
    label: "In Progress",
  },
  {
    value: "done",
    label: "Done",
  },
  {
    value: "canceled",
    label: "Canceled",
  },
];

export function ComboBoxResponsive({
  className,
  children,
  searchTarget,
}: {
  className?: string;
  children?: React.ReactNode;
  searchTarget?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = !useIsMobile();
  const [selectedStatus, setSelectedStatus] = React.useState<Status | null>(
    null
  );

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`w-full justify-start ${className}`}
            disabled
          >
            {children}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          {/*<StatusList setOpen={setOpen} setSelectedStatus={setSelectedStatus} />*/}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="w-[150px] justify-start">
          {children}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mt-4 border-t">
          {/*<StatusList setOpen={setOpen} setSelectedStatus={setSelectedStatus} />*/}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function StatusList({
  setOpen,
  setSelectedStatus,
  content,
  placeholder,
}: {
  setOpen: (open: boolean) => void;
  setSelectedStatus: (status: Status | null) => void;
  content: any[];
  placeholder?: string;
}) {
  return (
    <Command>
      <CommandInput placeholder={`i.e deep dive into web3.0`} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {content.map((item, index) => (
            <CommandItem
              key={index}
              value={item.name}
              onSelect={(value) => {
                setOpen(false);
              }}
            >
              {item.name}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
