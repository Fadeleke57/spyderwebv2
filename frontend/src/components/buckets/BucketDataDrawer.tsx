import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useEditSourceTitle, useFetchSource } from "@/hooks/sources";
import { useUpdateNote } from "@/hooks/sources"; // Assuming your hook is located here
import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Check, Edit, Pencil, SquareArrowOutUpRight, X } from "lucide-react";
import { formatDate } from "date-fns";
import { ScrollArea } from "../ui/scroll-area";
import { Textarea } from "../ui/textarea";
import { debounce, set } from "lodash";
import { useUser } from "@/context/UserContext";
import { toast } from "../ui/use-toast";
import { extractVideoId } from "@/lib/utils";
import { SourceAsNode } from "@/types/source";
import NoteComponent from "./Notes";

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
  const {
    mutateAsync: editSourceTitle,
    isPending: isTitleLoading,
    error: titleError,
  } = useEditSourceTitle(sourceId);
  const [source, setSource] = useState<SourceAsNode | null>(null);
  const [presignedUrl, setPresignedUrl] = useState("");
  const [title, setTitle] = useState(source?.name);
  const [content, setContent] = useState(source?.content);
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(source?.name);

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

  const isOwner = (source?.userId && user?.id) === source?.userId;

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

  const handleNewTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newTitle = e.target.value;
    setNewTitle(newTitle);
  };

  const handleNoteContentChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    // for notes only
    const newContent = e.target.value;
    setContent(newContent);
    debouncedSave(title || "", newContent);
  };

  const handleEditTitle = async () => {
    // any source
    if (!newTitle) {
      setIsEditing(false);
      return;
    }
    try {
      await editSourceTitle(newTitle);
      toast({ title: "Changes saved." });
      refetchSource();
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update note:", err);
    }
  };

  const mapSourceTypeToComponent = (type: string | undefined) => {
    switch (type) {
      case "website":
        return (
          <>
            <small className="text-muted-foreground">
              {formatDate(
                new Date(source ? source.updated_at + "Z" : ""),
                "MMMM dd, yyyy hh:mm a"
              )}
            </small>
            <iframe
              src={source?.url || ""}
              width="100%"
              height="450px"
              className="rounded-lg mt-4"
            />
          </>
        );
      case "document":
        return (
          <>
            <small className="text-muted-foreground">
              {formatDate(
                new Date(source ? source.updated_at + "Z" : ""),
                "MMMM dd, yyyy hh:mm a"
              )}
            </small>
            <object
              data={presignedUrl}
              type="application/pdf"
              width="100%"
              className="rounded-lg border h-[calc(97vh-210px)] mt-4"
            >
              <p>Your browser does not support PDFs.</p>
            </object>
          </>
        );
      case "youtube":
        return (
          <>
            <small className="text-muted-foreground">
              {formatDate(
                new Date(source ? source.updated_at + "Z" : ""),
                "MMMM dd, yyyy hh:mm a"
              )}
            </small>
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
              className="rounded-lg mt-4"
            ></iframe>
          </>
        );
      case "note":
        return (
          <NoteComponent
            source={source}
            content={content}
            isOwner={isOwner}
            updateError={updateError}
            handleNoteContentChange={handleNoteContentChange}
          />
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
        <SheetClose className="absolute right-4 top-10" />
        <SheetContent side={"left"} className="w-full lg:max-w-2xl">
          <SheetHeader className="border-b pb-4">
            <SheetTitle className="text-left w-11/12 font-bold flex items-center justify-between">
              {presignedUrl || source?.url ? (
                isEditing ? (
                  <Textarea
                    defaultValue={title}
                    onChange={(e) => handleNewTitleChange(e)}
                    placeholder="Title..."
                  />
                ) : (
                  <Link
                    href={presignedUrl || source?.url || ""}
                    target="_blank"
                    className="hover:underline hover:text-blue-500 inline"
                  >
                    <span>{source?.name || ""}</span>
                  </Link>
                )
              ) : isEditing ? (
                <Textarea
                  defaultValue={title}
                  onChange={(e) => handleNewTitleChange(e)}
                  placeholder="Title..."
                />
              ) : (
                <span>{title || source?.name || ""}</span>
              )}
            </SheetTitle>
            <SheetDescription className="text-left pr-4 font-semibold text-blue-500 flex flex-col gap-2 justify-start">
              {isOwner && (
                <div className="basis-1/3 flex flex-row space-x-2 w-fit">
                  {!isEditing && (
                    <Edit
                      className="cursor-pointer text-foreground hover:text-blue-500"
                      onClick={() => setIsEditing(!isEditing)}
                    ></Edit>
                  )}
                  {isEditing && (
                    <>
                      <X
                        className="cursor-pointer text-foreground hover:text-blue-500"
                        onClick={() => setIsEditing(false)}
                      ></X>
                      <Check
                        className="cursor-pointer text-foreground hover:text-blue-500"
                        onClick={handleEditTitle}
                      ></Check>
                    </>
                  )}
                </div>
              )}
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
