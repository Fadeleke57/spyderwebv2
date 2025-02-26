"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

interface TabsListProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  vertical?: boolean;
}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, vertical = false, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "rounded-md bg-muted p-1 text-muted-foreground",
      vertical
        ? "flex flex-col h-fit w-40 items-start justify-start"
        : "inline-flex h-10 items-center justify-center",
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

interface TabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  vertical?: boolean;
}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, vertical = false, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      vertical
        ? "flex w-full items-center justify-start"
        : "inline-flex items-center justify-center",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

interface TabContentProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> {
  vertical?: boolean;
}

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  TabContentProps
>(({ className, vertical = false, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(className, vertical ? "ml-4 pl-4 rounded-md" : "mt-4")}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
