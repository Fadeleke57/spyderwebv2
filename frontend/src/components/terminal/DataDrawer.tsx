import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArticleChart } from "./ArticleChart";
import { ArticleAsNode, ConfigFormValues } from "@/types/article";
import { useFetchArticleRelevantSentences } from "@/hooks/articles";
import { ArticleInfoTabs } from "./ArticleInfoTabs";

interface DataDrawerProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  article: ArticleAsNode;
  color?: string;
  config?: ConfigFormValues;
}

export function DataDrawer({
  open,
  setOpen,
  article,
  color,
  config,
}: DataDrawerProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side={"left"} className="w-[400px] sm:w-[540px]">
          <SheetHeader className="border-b pb-4">
            <SheetTitle className="text-left w-[300px] lg:w-content">
              Article Insights
            </SheetTitle>
            <SheetDescription className="text-left pr-4">
              Using sentiment analysis, subjectivity analysis, and a customized
              relevance score to deliver data.
            </SheetDescription>
          </SheetHeader>
          <div className="py-6">
            <ArticleInfoTabs article={article} color={color} config={config} />
          </div>
          <SheetFooter></SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
