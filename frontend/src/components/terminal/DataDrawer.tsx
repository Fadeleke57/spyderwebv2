"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ArticleChart } from "./ArticleChart";
import Link from "next/link";
import { ArticleAsNode } from "@/types/article";

interface DataDrawerProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  article: ArticleAsNode;
}

export function DataDrawer({ open, setOpen, article }: DataDrawerProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side={"left"} className="w-[400px] sm:w-[540px]">
          <SheetHeader className="border-b pb-4">
            <SheetTitle>Article Insights</SheetTitle>
            <SheetDescription>
              Using sentiment analysis, subjectivity analysis, and a customized
              relevance score to deliver data.
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col py-6">
            <ArticleChart article={article} />
          </div>
          <SheetFooter></SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
