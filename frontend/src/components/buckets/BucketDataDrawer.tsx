import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useFetchSource } from "@/hooks/sources";
import { useUpdateNote } from "@/hooks/sources"; // Assuming your hook is located here
import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { SquareArrowOutUpRight } from "lucide-react";
import { formatDate } from "date-fns";
import { ScrollArea } from "../ui/scroll-area";
import { Textarea } from "../ui/textarea";
import { debounce, set } from "lodash";
import { useUser } from "@/context/UserContext";
import { toast } from "../ui/use-toast";
import { extractVideoId } from "@/lib/utils";
import { SourceAsNode } from "@/types/source";

interface BucketDataDrawerProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  sourceId: string;
  bucketId: string;
}

export default function BucketDataDrawer({
  open,
  setOpen,
  sourceId,
  bucketId,
}: BucketDataDrawerProps) {
  const { user } = useUser();
  const {
    data: sourceData,
    isLoading: isSourceLoading,
    error: sourceError,
    refetch: refetchSource,
  } = useFetchSource(sourceId);
  const [source, setSource] = useState<SourceAsNode | null>(null);
  const [presignedUrl, setPresignedUrl] = useState("");
  const [title, setTitle] = useState(source?.name);
  const [content, setContent] = useState(source?.content);

  useEffect(() => {
    if (!sourceData) return;
    setSource(sourceData.result);
    setTitle(sourceData.result.name);
    setContent(sourceData.result.content);
    setPresignedUrl(sourceData.file_url);
  }, [sourceData]);

  const {
    mutateAsync: updateNote,
    isPending: isUploading,
    error: updateError,
  } = useUpdateNote(bucketId, sourceId);

  const isOwner = source?.userId && user?.id === source?.userId;

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
    debouncedSave(title || "", newContent);
  };

  const mapSourceTypeToComponent = (type: string | undefined) => {
    switch (type) {
      case "website":
        return (
          <iframe
            src={source?.url || ""}
            width="100%"
            height="450px"
            className="rounded-lg"
          />
        );
      case "document":
        console.log("presignedUrl", presignedUrl);
        return (
          <object
            data={presignedUrl}
            type="application/pdf"
            width="100%"
            className="rounded-lg border h-[calc(100vh-210px)]"
          >
            <p>Your browser does not support PDFs.</p>
          </object>
        );
      case "youtube":
        return (
          <iframe
            width="100%"
            height="450px"
            src={`https://www.youtube.com/embed/${
              extractVideoId(source?.url) || ""
            }`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="rounded-lg"
          ></iframe>
        );
      case "note":
        return (
          <ScrollArea className="px-4 h-[calc(100vh-210px)]">
            <small className="text-muted-foreground">
              {formatDate(
                new Date(source ? source.updated_at + "Z" : ""),
                "MMMM dd, yyyy hh:mm a"
              )}
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
              <h3 className="text-2xl font-semibold my-2">{title}</h3>
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
              <p className="text-slate-500">{content}</p>
            )}

            {updateError && <p className="text-red-500">{updateError}</p>}
          </ScrollArea>
        );
      default:
        return null;
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTitle("");
    setContent("");
    setPresignedUrl("");
    setSource(null);
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      <Sheet open={open} onOpenChange={handleClose}>
        <SheetContent side={"left"} className="w-full lg:max-w-2xl">
          <SheetHeader className="border-b pb-4">
            <SheetTitle className="text-left w-[300px] font-bold lg:w-content">
              {presignedUrl || source?.url ? (
                <Link
                  href={presignedUrl || source?.url || ""}
                  target="_blank"
                  className="hover:underline hover:text-blue-500 inline"
                >
                  {presignedUrl || source?.url ? <SquareArrowOutUpRight /> : ""}
                  <span>{source?.name || ""}</span>
                </Link>
              ) : (
                <span>{title || source?.name || ""}</span>
              )}
            </SheetTitle>
            <SheetDescription className="text-left pr-4 font-semibold text-blue-500">
              {source?.type}
            </SheetDescription>
          </SheetHeader>
          <div className="py-6">{mapSourceTypeToComponent(source?.type)}</div>
          <SheetFooter></SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
