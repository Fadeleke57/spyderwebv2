import { useEditSourceTitle, useFetchSource } from "@/hooks/sources";
import { useSourceStore } from "@/store/sourceStore";
import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Edit, X } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Textarea } from "../ui/textarea";
import { useUser } from "@/context/UserContext";
import { extractVideoId } from "@/lib/utils";
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
import { VoiceNoteComponent } from "../sources/VoiceNoteComponent";
import { getTypeIcon } from "../chat/genui/graphcontext";
import { toast } from "sonner";
import { useRouter } from "next/router";
import LinkPreview from "../sources/LinkPreview";

interface WebDataModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function WebDataModal({ open, setOpen }: WebDataModalProps) {
  const {
    selectedSourceId: sourceId,
    source,
    setSource,
    isEditingSource,
    setIsEditingSource,
    sourceTitle,
    setSourceTitle,
    sourceContent,
    setSourceContent,
    presignedUrl,
    setPresignedUrl,
  } = useSourceStore();

  const { user } = useUser();
  const router = useRouter();
  const { webId } = router.query;
  const {
    data: sourceData,
    refetch: refetchSource,
    isLoading: sourceLoading,
  } = useFetchSource(sourceId);

  const { mutateAsync: editSourceTitle } = useEditSourceTitle(sourceId);

  useEffect(() => {
    if (!sourceData) return;
    setSource(sourceData.result);
    setSourceTitle(sourceData.result.name);
    setSourceContent(sourceData.result.content);
    setPresignedUrl(sourceData.file_url);
  }, [sourceData]);

  const isOwner = (source && user && source.userId === user.id) || false;

  const handleNewTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newTitle = e.target.value;
    setSourceTitle(newTitle);
  };

  const handleEditTitle = async () => {
    // any source
    if (!sourceTitle || !source || sourceTitle === source.name) {
      setIsEditingSource(false);
      return;
    }
    try {
      handleNewTitleChange({ target: { value: sourceTitle } } as any);
      await editSourceTitle(sourceTitle);
      refetchSource();
      setIsEditingSource(false);
      toast.success("Changes saved");
    } catch (err) {
      console.error("Failed to update note:", err);
    }
  };

  const mapSourceTypeToComponent = (type: string | undefined) => {
    switch (type) {
      case "website":
        return (
          <LinkPreview
            url={source ? source.url : ""}
            disabled={!!source?.ogImage || source?.ogImage === ""}
          />
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
              className="rounded-lg min-h-[77dvh]"
            ></iframe>
          </>
        );
      case "note":
        return (
          <NoteComponent
            webId={webId as string}
            source={source}
            isOwner={isOwner}
          />
        );
      case "voice_note":
        return <VoiceNoteComponent source={source} />;
    }
  };

  const handleClose = () => {
    setSourceTitle("");
    setSourceContent("");
    setPresignedUrl("");
    setSource(null);
    setOpen(false);
    setIsEditingSource(false);
  };

  useEffect(() => {
    if (!sourceId) {
      handleClose();
    }
  }, [sourceId]);

  return (
    <div className="grid grid-cols-2 gap-2">
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            handleClose();
          }
        }}
      >
        <DialogClose onClick={handleClose} className="absolute right-4 top-10">
          <ArrowLeft></ArrowLeft>
        </DialogClose>
        <DialogContent className="max-w-full h-full">
          <div className="flex flex-col gap-4">
            <DialogTitle className="text-left w-11/12 font-bold relative group min-h-[50px]">
              {sourceLoading ? (
                <Skeleton className="h-8 w-3/4 rounded-lg" />
              ) : presignedUrl || source?.url ? (
                isEditingSource ? (
                  <div className="flex items-center justify-between">
                    <Textarea
                      defaultValue={sourceTitle}
                      onChange={(e) => handleNewTitleChange(e)}
                      placeholder="Title..."
                      className="w-full text-lg font-bold resize-none p-0 pl-4 !m-0 !shadow-none !bg-transparent rounded-md focus-visible:ring-0 focus-visible:ring-offset-0 rounded-lg"
                    />
                    {isOwner && (
                      <div className="absolute left-0 -bottom-4 flex border rounded-sm">
                        <Button
                          size={"icon"}
                          onClick={() => setIsEditingSource(false)}
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
                      {source?.type === "website" ||
                      source?.type === "youtube" ||
                      source?.type === "document" ? (
                        <FaviconDisplay url={source?.url || ""} />
                      ) : source?.type ? (
                        getTypeIcon(source?.type)
                      ) : null}
                      <span className="flex flex-row items-center gap-2">
                        {sourceTitle || "Loading..."}
                      </span>
                    </Link>
                    {isOwner && (
                      <div className="absolute left-0 -bottom-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out flex space-x-2">
                        <Edit
                          size={20}
                          className="cursor-pointer text-foreground hover:text-violet-400"
                          onClick={() => setIsEditingSource(!isEditingSource)}
                        />
                      </div>
                    )}
                  </div>
                )
              ) : isEditingSource ? (
                <div className="flex items-center justify-between relative">
                  <Textarea
                    defaultValue={sourceTitle}
                    onChange={(e) => handleNewTitleChange(e)}
                    placeholder="Title..."
                    className="w-full text-lg font-bold resize-none !p-0 !m-0 !shadow-none !bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 rounded-lg"
                  />
                  {isOwner && (
                    <div className="absolute left-0 -bottom-4 flex border rounded-sm">
                      <Button
                        size={"icon"}
                        onClick={() => setIsEditingSource(false)}
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
                  <span className="text-lg">
                    {sourceTitle || source?.name || ""}
                  </span>
                  {isOwner && (
                    <div className="absolute left-0 -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out flex space-x-2">
                      <Edit
                        size={20}
                        className="cursor-pointer text-foreground hover:text-violet-400"
                        onClick={() => setIsEditingSource(!isEditingSource)}
                      />
                    </div>
                  )}
                </div>
              )}
            </DialogTitle>
            <DialogDescription className="text-left pb-1 font-semibold text-muted-foreground flex flex-col gap-2 justify-start border-b border-b-muted">
              {sourceLoading || !source ? (
                <div className="flex flex-row justify-between items-center">
                  <Skeleton className="h-4 w-24 rounded-lg" />
                  <Skeleton className="h-4 w-32 rounded-lg" />
                </div>
              ) : (
                <div className="flex flex-row justify-between items-center">
                  <span className="text-violet-400">{source.type}</span>
                  <div className="flex flex-col items-end space-y-1">
                    <AutoLinkerIndicator
                      sourceId={sourceId}
                      webId={webId as string}
                    />
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
              {sourceLoading || !source ? (
                <Skeleton className="min-h-[77dvh] lg:h-[97%] lg:min-h-[0] w-full mt-4 rounded-lg" />
              ) : (
                mapSourceTypeToComponent(source?.type)
              )}
            </div>
            <ConnectionsConfig isOwner={isOwner}></ConnectionsConfig>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
