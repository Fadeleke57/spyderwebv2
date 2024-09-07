import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ArticleChart } from "./ArticleChart";
import { ArticleAsNode } from "@/types/article";

interface DataDrawerProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  article: ArticleAsNode;
  color?: string;
}

export function DataDrawer({ open, setOpen, article, color }: DataDrawerProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side={"left"} className="w-[400px] sm:w-[540px]">
          <SheetHeader className="border-b pb-4">
            <SheetTitle className="text-left w-[300px] lg:w-content">Article Insights</SheetTitle>
            <SheetDescription className="text-left pr-4">
              Using sentiment analysis, subjectivity analysis, and a customized
              relevance score to deliver data.
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col py-6">
            <ArticleChart article={article} color={color} />
          </div>
          <SheetFooter></SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
