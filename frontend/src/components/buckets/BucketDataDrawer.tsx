import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useRenderFile } from "@/hooks/sources";
import { useState, useEffect } from "react";
import { SourceAsNode } from "@/types/source";
import Link from "next/link";
import { SquareArrowOutUpRight } from "lucide-react";
import { formatDate } from "date-fns";
import { ScrollArea } from "../ui/scroll-area";

interface BucketDataDrawerProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  source: SourceAsNode;
}

export default function BucketDataDrawer({
  open,
  setOpen,
  source,
}: BucketDataDrawerProps) {
  const [fileUrl, setFileUrl] = useState<string>("");
  const { getPresignedUrl, isLoading, error } = useRenderFile(source.url);

  useEffect(() => {
    if (open && source.type !== "website" && source.type !== "note") {
      handleGetPresignedUrl();
    }
  }, [open, source]);

  const handleGetPresignedUrl = async () => {
    try {
      const url = await getPresignedUrl();
      setFileUrl(url);
    } catch (err) {
      console.error("Failed to get presigned URL:", err);
    }
  };

  const mapSourceTypeToComponent = (type: string) => {
    switch (type) {
      case "website":
        return (
          <iframe
            src={source.url}
            width="100%"
            height="450px"
            className="rounded-lg"
          />
        );
      case "document":
        return (
          <object
            data={fileUrl}
            type="application/pdf"
            width="100%"
            className="rounded-lg border h-[calc(100vh-210px)]"
          >
            <p>Your browser does not support PDFs.</p>
          </object>
        );
      case "note":
        return (
          <ScrollArea className="px-4 h-[calc(100vh-210px)]">
            <small className="text-muted-foreground mb-8">
              {formatDate(new Date(source.updated_at), "MMMM dd, yyyy hh:mm a")}
            </small>
            <p className="mt-4">{source.content}</p>
          </ScrollArea>
        );
      default:
        return null;
    }
  };
  return (
    <div className="grid grid-cols-2 gap-2">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side={"left"} className="w-[400px] sm:w-[600px]">
          <SheetHeader className="border-b pb-4">
            <SheetTitle className="text-left w-[300px] font-bold lg:w-content">
              {fileUrl || source?.url ? (
                <Link
                  href={fileUrl || source?.url || ""}
                  target="_blank"
                  className="hover:underline hover:text-blue-500 inline"
                >
                  {fileUrl || source?.url ? <SquareArrowOutUpRight /> : ""}
                  <h1>{source?.name || ""}</h1>
                </Link>
              ) : (
                <h1>{source?.name || ""}</h1>
              )}
            </SheetTitle>
            <SheetDescription className="text-left pr-4 font-semibold text-blue-500">
              {source.type}
            </SheetDescription>
          </SheetHeader>
          <div className="py-6">{mapSourceTypeToComponent(source?.type)}</div>
          <SheetFooter></SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
