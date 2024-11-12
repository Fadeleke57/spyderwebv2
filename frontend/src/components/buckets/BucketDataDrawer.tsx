import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { BucketConfigFormValues } from "@/types/article";
import { SourceInfoTabs } from "./SourceInfoTabs";
import { SourceAsNode } from "@/types/source";
import Link from "next/link";

interface BucketDataDrawerProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  source: SourceAsNode;
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
              <div className="py-6">
                <Link href={source?.url} target="_blank" className="hover:underline"><h1>{source?.name || ""}</h1></Link>
              </div>
            </SheetTitle>
            <SheetDescription className="text-left pr-4"></SheetDescription>
          </SheetHeader>
          <div className="py-6">
            {source.type === "website" ? (
              <Link href={source.url} target="_blank" />
            ) : (
              <>
                <h3>
                  File size:{" "}
                  {source?.size ? (source.size / 10000).toFixed(2) : 0} KB
                </h3>
                <h3>
                  File type:{" "}
                  {source?.url?.split(".")[
                    source?.url?.split(".").length - 1
                  ] || "N/A"}
                </h3>
              </>
            )}
          </div>
          <SheetFooter></SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
