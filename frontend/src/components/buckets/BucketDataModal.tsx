import { useEditSourceTitle, useFetchSource } from "@/hooks/sources";
import { useUpdateNote } from "@/hooks/sources";
import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Edit, SquareArrowOutUpRight, X } from "lucide-react";
import { formatDate } from "date-fns";
import { Textarea } from "../ui/textarea";
import { debounce } from "lodash";
import { useUser } from "@/context/UserContext";
import { toast } from "../ui/use-toast";
import { extractVideoId } from "@/lib/utils";
import { SourceAsNode } from "@/types/source";
import NoteComponent from "./Notes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";
import ConnectionsConfig from "../sources/ConnectionConfig";

interface BucketDataDrawerProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  sourceId: string;
  bucketId: string;
}

export default function BucketDataModal({
  open,
  setOpen,
  sourceId,
  bucketId,
}: BucketDataDrawerProps) {
  const { user } = useUser();
  const { data: sourceData, refetch: refetchSource } = useFetchSource(sourceId);
  const { mutateAsync: editSourceTitle } = useEditSourceTitle(sourceId);

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
                new Date(source ? source.updated + "Z" : ""),
                "MMMM dd, yyyy hh:mm a"
              )}
            </small>
            <iframe
              src={source?.url || ""}
              width="100%"
              height="510px"
              className="rounded-lg mt-4"
            />
          </>
        );
      case "document":
        return (
          <>
            <small className="text-muted-foreground">
              {formatDate(
                new Date(source ? source.updated + "Z" : ""),
                "MMMM dd, yyyy hh:mm a"
              )}
            </small>
            <object
              data={presignedUrl}
              type="application/pdf"
              width="100%"
              className="rounded-lg border h-[calc(100vh-200px)] mt-4"
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
                new Date(source ? source.updated + "Z" : ""),
                "MMMM dd, yyyy hh:mm a"
              )}
            </small>
            <iframe
              width="100%"
              height="510px"
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
            bucketId={bucketId}
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
    setTitle("");
    setContent("");
    setPresignedUrl("");
    setSource(null);
    setOpen(false);
    setIsEditing(false);
    setNewTitle("");
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogClose onClick={handleClose} className="absolute right-4 top-10">
          <ArrowLeft></ArrowLeft>
        </DialogClose>
        <DialogContent className="max-w-full h-full">
          <div className="flex flex-col gap-4">
            <DialogTitle className="text-left w-11/12 font-bold flex items-center justify-between">
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
                    <span className="flex flex-row items-center gap-2">
                      {source?.name || ""}
                      <SquareArrowOutUpRight className="hidden md:inline" size={16}></SquareArrowOutUpRight>
                    </span>
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
            </DialogTitle>
            <DialogDescription className="text-left pr-4 font-semibold text-blue-500 flex flex-col gap-2 justify-start border-b border-b-muted">
              {isOwner && (
                <div className="basis-1/3 flex flex-row space-x-2 w-fit">
                  {!isEditing && (
                    <Edit
                      size={20}
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
            </DialogDescription>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <div>{mapSourceTypeToComponent(source?.type)}</div>
            <ConnectionsConfig
              bucketId={bucketId}
              sourceId={sourceId}
              isOwner={isOwner}
            ></ConnectionsConfig>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
