import { useEditSourceTitle, useFetchSource } from "@/hooks/sources";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Edit, X } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Textarea } from "../ui/textarea";
import { useUser } from "@/context/UserContext";
import { toast } from "../ui/use-toast";
import { extractVideoId } from "@/lib/utils";
import { SourceAsNode } from "@/types/source";
import NoteComponent from "../notes/Notes";
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
import FaviconDisplay from "../utility/FaviconDisplay";
import AutoLinkerIndicator from "../sources/AutoLinkerIndicator";

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!sourceData) return;
    setSource(sourceData.result);
    setTitle(sourceData.result.name);
    setContent(sourceData.result.content);
    setPresignedUrl(sourceData.file_url);
    setIsLoading(false);
  }, [sourceData]);
  const isOwner = (source?.userId && user?.id) === source?.userId;

  const handleNewTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
  };

  const handleEditTitle = async () => {
    // any source
    if (!title) {
      setIsEditing(false);
      return;
    }
    try {
      handleNewTitleChange({ target: { value: title } } as any);
      await editSourceTitle(title);
      refetchSource();
      setIsEditing(false);
      toast({ title: "Changes saved." });
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
      case "pdf":
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
              }?t=0s`}
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
          <NoteComponent webId={webId} source={source} isOwner={isOwner} />
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
                      className="w-full text-lg font-bold resize-none !p-0 !m-0 !shadow-none !bg-transparent rounded-md focus-visible:ring-0 focus-visible:ring-offset-0 rounded-lg"
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
                      className="hover:underline hover:text-violet-400 inline text-lg flex flex-row items-center gap-2"
                    >
                      <FaviconDisplay url={source?.url || ""} />
                      <span className="flex flex-row items-center gap-2">
                        {title || "Loading..."}
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
                    className="w-full text-lg font-bold resize-none !p-0 !m-0 !shadow-none !bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 rounded-lg"
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
            <DialogDescription className="text-left pb-1 font-semibold text-muted-foreground flex flex-col gap-2 justify-start border-b border-b-muted">
              {isLoading ? (
                <div className="flex flex-row justify-between items-center">
                  <Skeleton className="h-4 w-24 rounded-lg" />
                  <Skeleton className="h-4 w-32 rounded-lg" />
                </div>
              ) : (
                <div className="flex flex-row justify-between items-center">
                  <span className="text-violet-400">{source?.type}</span>
                  <div className="flex flex-col items-end space-y-1">
                    <AutoLinkerIndicator sourceId={sourceId} webId={webId} />
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
