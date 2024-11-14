import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useRenderFile } from "@/hooks/sources";
import { useUpdateNote } from "@/hooks/sources"; // Assuming your hook is located here
import { useState, useEffect, useCallback } from "react";
import { SourceAsNode } from "@/types/source";
import Link from "next/link";
import { SquareArrowOutUpRight } from "lucide-react";
import { formatDate } from "date-fns";
import { ScrollArea } from "../ui/scroll-area";
import { Textarea } from "../ui/textarea";
import { debounce } from "lodash";
import { useUser } from "@/context/UserContext";
import { toast } from "../ui/use-toast";

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
  const { user } = useUser();
  const [fileUrl, setFileUrl] = useState<string>("");
  const [title, setTitle] = useState(source.name);
  const [content, setContent] = useState(source.content);
  const { getPresignedUrl, isLoading, error } = useRenderFile(source.url);
  const {
    updateNote,
    isUploading,
    error: updateError,
  } = useUpdateNote(source.bucketId, source.sourceId);

  const isOwner =source?.userId && user?.id === source?.userId;

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

  const debouncedSave = useCallback(
    debounce(async (newTitle: string, newContent: string) => {
      try {
        await updateNote({
          title: newTitle,
          content: newContent,
        });
        toast({ title: "Changes saved." });
      } catch (err) {
        console.error("Failed to update note:", err);
      }
    }, 1000),
    [updateNote]
  );

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    debouncedSave(newTitle, content || "");
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    debouncedSave(title, newContent);
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
            <small className="text-muted-foreground">
              {formatDate(new Date(source.updated_at), "MMMM dd, yyyy hh:mm a")}
            </small>
            {isOwner ? (
              <Textarea
                value={title}
                placeholder="Title..."
                rows={1}
                className="w-full min-h-[2rem] bg-transparent p-0 text-3xl font-bold leading-tight resize-none focus:outline-none border-none bg-none p-0 ring-offset-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none m-0 py-0 text-2xl font-semibold my-2"
                onInput={(e: any) => {
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                onChange={handleTitleChange}
              />
            ) : (
              <h3 className="text-2xl font-semibold my-2">{source.name}</h3>
            )}
            {isOwner ? (
              <Textarea
                value={content}
                placeholder="Content..."
                rows={1}
                className="w-full min-h-[1px] bg-transparent p-0 text-lg leading-relaxed resize-none focus:outline-none border-none bg-none p-0 ring-offset-none focus-visible:ring-0 focus-visible:ring-offset-0 text-lg font-normal resize-none text-sm text-muted-foreground"
                onInput={(e: any) => {
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                onChange={handleContentChange}
              />
            ) : (
              <p className="text-slate-500">{source.content}</p>
            )}

            {updateError && <p className="text-red-500">{updateError}</p>}
          </ScrollArea>
        );
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side={"left"} className="w-full lg:max-w-xl">
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
                <h1>{title || source?.name || ""}</h1>
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
