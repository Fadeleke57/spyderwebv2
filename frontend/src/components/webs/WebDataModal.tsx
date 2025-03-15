import { useEditSourceTitle, useFetchSource } from "@/hooks/sources";
import { useUpdateNote } from "@/hooks/sources";
import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  Edit,
  SquareArrowOutUpRight,
  X,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
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
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

interface WebDataDrawerProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  sourceId: string;
  webId: string;
}

export default function WebDataModal({
  open,
  setOpen,
  sourceId,
  webId,
}: WebDataDrawerProps) {
  const { user } = useUser();
  const { data: sourceData, refetch: refetchSource } = useFetchSource(sourceId);
  const { mutateAsync: editSourceTitle } = useEditSourceTitle(sourceId);

  const [source, setSource] = useState<SourceAsNode | null>(null);
  const [presignedUrl, setPresignedUrl] = useState("");
  const [title, setTitle] = useState(source?.name);
  const [content, setContent] = useState(source?.content);
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(source?.name);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!sourceData) return;
    setSource(sourceData.result);
    setTitle(sourceData.result.name);
    setContent(sourceData.result.content);
    setPresignedUrl(sourceData.file_url);
    setIsLoading(false);
  }, [sourceData]);

  const {
    mutateAsync: updateNote,
    isPending: isUploading,
    error: updateError,
  } = useUpdateNote(webId, sourceId);

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
            <iframe
              src={source?.url || ""}
              width="100%"
              className="rounded-lg h-full"
            />
          </>
        );
      case "document":
        return (
          <>
            <object
              data={presignedUrl}
              type="application/pdf"
              width="100%"
              className="rounded-lg border h-full"
            >
              <p>Your browser does not support PDFs.</p>
            </object>
          </>
        );
      case "youtube":
        return (
          <>
            <iframe
              width="100%"
              src={`https://www.youtube.com/embed/${
                extractVideoId(source?.url) || ""
              }`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="rounded-lg h-full"
            ></iframe>
          </>
        );
      case "note":
        return (
          <NoteComponent
            webId={webId}
            source={source}
            content={content}
            isOwner={isOwner}
            updateError={updateError}
            handleNoteContentChange={handleNoteContentChange}
          /> /*
          <Editor
            webId={webId}
            source={source} 
            content={content}
            isOwner={isOwner}
            updateError={updateError}
            handleNoteContentChange={handleNoteContentChange}
          />*/
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
    setIsLoading(true);
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogClose onClick={handleClose} className="absolute right-4 top-10">
          <ArrowLeft></ArrowLeft>
        </DialogClose>
        <DialogContent className="max-w-full h-full">
          <div className="flex flex-col gap-4">
            <DialogTitle className="text-left w-11/12 font-bold relative group min-h-[50px]">
              {isLoading ? (
                <Skeleton className="h-8 w-3/4 rounded-lg" />
              ) : presignedUrl || source?.url ? (
                isEditing ? (
                  <div className="flex items-center justify-between">
                    <Textarea
                      defaultValue={title}
                      onChange={(e) => handleNewTitleChange(e)}
                      placeholder="Title..."
                      className="w-full text-lg font-bold resize-none !p-0 !m-0 !shadow-none !bg-transparent rounded-md focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    {isOwner && (
                      <div className="absolute left-0 -bottom-4 flex border rounded-sm">
                        <Button
                          size={"icon"}
                          onClick={() => setIsEditing(false)}
                          className="p-0 m-0 h-8 w-8 rounded-none"
                        >
                          <X size={16} />
                        </Button>
                        <Button
                          size={"icon"}
                          onClick={handleEditTitle}
                          className="p-0 m-0 h-8 w-8 rounded-none"
                        >
                          <Check size={16} />
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <Link
                      href={presignedUrl || source?.url || ""}
                      target="_blank"
                      className="hover:underline hover:text-violet-400 inline text-lg"
                    >
                      <span className="flex flex-row items-center gap-2">
                        {source?.name || "Loading..."}
                      </span>
                    </Link>
                    {isOwner && (
                      <div className="absolute left-0 -bottom-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out flex space-x-2">
                        <Edit
                          size={20}
                          className="cursor-pointer text-foreground hover:text-violet-400"
                          onClick={() => setIsEditing(!isEditing)}
                        />
                      </div>
                    )}
                  </div>
                )
              ) : isEditing ? (
                <div className="flex items-center justify-between relative">
                  <Textarea
                    defaultValue={title}
                    onChange={(e) => handleNewTitleChange(e)}
                    placeholder="Title..."
                    className="w-full text-lg font-bold resize-none !p-0 !m-0 !shadow-none !bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  {isOwner && (
                    <div className="absolute left-0 -bottom-4 flex border rounded-sm">
                      <Button
                        size={"icon"}
                        onClick={() => setIsEditing(false)}
                        className="p-0 m-0 h-8 w-8 rounded-none"
                      >
                        <X size={16} />
                      </Button>
                      <Button
                        size={"icon"}
                        onClick={handleEditTitle}
                        className="p-0 m-0 h-8 w-8 rounded-none"
                      >
                        <Check size={16} />
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between relative">
                  <span className="text-lg">{title || source?.name || ""}</span>
                  {isOwner && (
                    <div className="absolute left-0 -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out flex space-x-2">
                      <Edit
                        size={20}
                        className="cursor-pointer text-foreground hover:text-violet-400"
                        onClick={() => setIsEditing(!isEditing)}
                      />
                    </div>
                  )}
                </div>
              )}
            </DialogTitle>
            <DialogDescription className="text-left pr-4 pb-1 font-semibold text-muted-foreground flex flex-col gap-2 justify-start border-b border-b-muted">
              {isLoading ? (
                <div className="flex flex-row justify-between items-center">
                  <Skeleton className="h-4 w-24 rounded-lg" />
                  <Skeleton className="h-4 w-32 rounded-lg" />
                </div>
              ) : (
                <div className="flex flex-row justify-between items-center">
                  <span className="text-violet-400">{source?.type}</span>
                  {source?.updated && (
                    <small>
                      {formatDate(source?.updated.toString(), {
                        onlyDate: true,
                      })}{" "}
                      at{" "}
                      {formatDate(source?.updated.toString(), {
                        onlyTime: true,
                      })}
                    </small>
                  )}
                </div>
              )}
            </DialogDescription>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <div>
              {isLoading ? (
                <Skeleton className="h-[97%] w-full mt-4 rounded-lg" />
              ) : (
                mapSourceTypeToComponent(source?.type)
              )}
            </div>
            <ConnectionsConfig
              webId={webId}
              sourceId={sourceId}
              isOwner={isOwner}
            ></ConnectionsConfig>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
