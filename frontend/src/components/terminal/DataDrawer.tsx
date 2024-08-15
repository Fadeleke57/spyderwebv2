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

export function DataDrawer() {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">News article</Button>
        </SheetTrigger>
        <SheetContent side={"left"} className="w-[400px] sm:w-[540px]">
          <SheetHeader className="border-b pb-4">
          <SheetTitle>Article Insights</SheetTitle>
            <SheetDescription>
              Using sentiment analysis, subjectivity analysis, and a customized
              relevance score to deliver data.
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col py-6">
            <ArticleChart article_id={"iphone-x-privacy-apple"} />
          </div>
          <SheetFooter></SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
