import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SourceChart } from "./SourceChart";
import { ArticleAsNode, BucketConfigFormValues, ConfigFormValues } from "@/types/article";
import { useFetchArticleRelevantSentences } from "@/hooks/articles";
import { SourceInfoTabs } from "./SourceInfoTabs";

interface BucketDataDrawerProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  source: ArticleAsNode;
  color?: string;
  config?: BucketConfigFormValues;
}

export default function BucketDataDrawer({
  open,
  setOpen,
  source,
  color,
  config,
}: BucketDataDrawerProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side={"left"} className="w-[400px] sm:w-[540px]">
          <SheetHeader className="border-b pb-4">
            <SheetTitle className="text-left w-[300px] lg:w-content">
              Source Information
            </SheetTitle>
            <SheetDescription className="text-left pr-4">
              
            </SheetDescription>
          </SheetHeader>
          <div className="py-6">
            <SourceInfoTabs source={source} color={color} config={config} />
          </div>
          <SheetFooter></SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
