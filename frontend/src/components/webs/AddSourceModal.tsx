import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { CreateWeb } from "@/types/web";
import { Web } from "@/types/web";
import {
  useFileUpload,
  useUploadWebsite,
  useUploadYoutube,
} from "@/hooks/sources";
import { toast } from "../ui/use-toast";
import gsap from "gsap";
import { extractVideoId } from "@/lib/utils";
import { DialogTitle } from "@radix-ui/react-dialog";
import {
  UploadFile,
  UploadWebsite,
  UploadYoutube,
  UploadVoiceNote,
} from "./AddSourceViews";
import { Drawer, DrawerContent, DrawerHeader } from "../ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { Skeleton } from "../ui/skeleton";

type AddSourceModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  config: CreateWeb;
  setConfig: (value: CreateWeb) => void;
  web: Web;
  refreshSources: () => void;
  refreshWeb: () => void;
  view?: string;
  setIsWebDataModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedSourceId: React.Dispatch<React.SetStateAction<string>>;
  handleFileUpload: (files: FileList | null) => void;
  isFileUploading: boolean;
  setParseObsidianLinks: React.Dispatch<React.SetStateAction<boolean>>;
  children: React.ReactNode;
  handleVoiceNoteUpload?: (blob: Blob) => Promise<void>;
  isVoiceNoteUploading?: boolean;
};

export default function AddSourceModal({
  web,
  open,
  setOpen,
  view = "default",
  children,
  refreshSources,
  refreshWeb,
  setIsWebDataModalOpen,
  setSelectedSourceId,
  handleFileUpload,
  isFileUploading,
  setParseObsidianLinks,
  handleVoiceNoteUpload,
  isVoiceNoteUploading,
}: AddSourceModalProps) {
  const isMobile = useIsMobile();
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");

  const {
    mutateAsync: uploadWebsite,
    error: websiteUploadError,
    isPending: isWebsiteUploading,
  } = useUploadWebsite(web.webId);

  const {
    mutateAsync: uploadYoutube,
    error: youtubeError,
    isPending: isYoutubeUploading,
  } = useUploadYoutube(web.webId);

  const contentRef = useRef(null);

  const handleWebsiteUpload = async (url: string) => {
    try {
      const sourceId = await uploadWebsite(url);
      toast({
        title: "Website uploaded",
        description: "Website uploaded successfully",
        duration: 500,
      });
      refreshSources();
      refreshWeb();
      setSelectedSourceId(sourceId);
      handleClose();
      setIsWebDataModalOpen(true);
    } catch (err: any) {
      console.error(err);
      toast({
        variant: "destructive",
        title: `${
          err.response?.status === 400
            ? "Unable to upload this website"
            : "Error uploading website"
        }`,
      });
    }
  };

  const handleYoutubeUpload = async (url: string) => {
    try {
      const videoId = extractVideoId(url);
      const sourceId = await uploadYoutube(videoId as string);
      toast({
        title: "Uploaded",
        description: "Youtube video uploaded successfully",
        duration: 500,
      });
      refreshSources();
      refreshWeb();
      setSelectedSourceId(sourceId);
      handleClose();
      setIsWebDataModalOpen(true);
    } catch (err: any) {
      console.error(err);
      toast({
        variant: "destructive",
        title: `${
          err.response?.status === 400
            ? "Unable to upload this video"
            : "Error uploading video"
        }`,
      });
    }
  };

  const handleWebsiteUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWebsiteUrl(e.target.value);
  };

  const handleYoutubeUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setYoutubeUrl(e.target.value);
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { x: "100%", opacity: 0 },
        { x: "0%", opacity: 1, duration: 0.5, ease: "power3.out" }
      );
    }
  }, [view]);

  function mapViewToContent() {
    switch (view) {
      case "default":
        return (
          <UploadFile
            handleFileUpload={handleFileUpload}
            setParseObsidianLinks={setParseObsidianLinks}
          />
        );
      case "website":
        return (
          <UploadWebsite
            isWebsiteUploading={isWebsiteUploading}
            websiteUrl={websiteUrl}
            handleWebsiteUrlChange={handleWebsiteUrlChange}
            handleWebsiteUpload={handleWebsiteUpload}
          />
        );
      case "youtube":
        return (
          <UploadYoutube
            youtubeUrl={youtubeUrl}
            handleYoutubeUrlChange={handleYoutubeUrlChange}
            handleYoutubeUpload={handleYoutubeUpload}
            isYoutubeUploading={isYoutubeUploading}
          />
        );
      case "voice-note":
        return (
          <UploadVoiceNote
            isVoiceNoteUploading={isVoiceNoteUploading || false}
            handleVoiceNoteUpload={
              handleVoiceNoteUpload || (() => Promise.resolve())
            }
          />
        );
      default:
        return null;
    }
  }

  function mapViewToHeader() {
    switch (view) {
      case "default":
        return (
          <div className="space-y-2">
            <DialogTitle className="scroll-m-20 text-2xl lg:text-3xl font-extrabold tracking-tight lg:text-6xl text-left">
              <span>Upload File</span>
            </DialogTitle>
            <p className="text-sm max-w-full md:max-w-lg lg:text-md text-muted-foreground text-left">
              Files are the building blocks of knowledge. Upload them here.
              Supported types include .pdf, .txt, and .md. Batches are limited
              to 4MB.
            </p>
          </div>
        );
      case "website":
        return (
          <div className="space-y-2">
            <DialogTitle className="scroll-m-20 text-2xl lg:text-3xl font-extrabold tracking-tight lg:text-6xl text-left">
              <span>Add Website</span>
            </DialogTitle>
            <p className="text-sm max-w-full md:max-w-lg lg:text-md text-muted-foreground text-left">
              Websites are the building blocks of knowledge. Upload them here.
              Paywalled websites are not supported. Some websites may block you
              from accessing them.
            </p>
          </div>
        );
      case "youtube":
        return (
          <div className="space-y-2">
            <DialogTitle className="scroll-m-20 text-2xl lg:text-3xl font-extrabold tracking-tight lg:text-6xl text-left">
              <span>Add YouTube Video</span>
            </DialogTitle>
            <p className="text-sm max-w-full md:max-w-lg lg:text-md text-muted-foreground text-left">
              Videos are the building blocks of knowledge. Upload them here.
            </p>
          </div>
        );
      case "voice-note":
        return (
          <div className="space-y-2">
            <DialogTitle className="scroll-m-20 text-2xl lg:text-3xl font-extrabold tracking-tight lg:text-6xl text-left">
              <span>Record Voice Note</span>
            </DialogTitle>
            <p className="text-sm max-w-full md:max-w-lg lg:text-md text-muted-foreground text-left">
              Voice notes are the building blocks of knowledge. Record your
              thoughts here. Supported format is WebM audio.
            </p>
          </div>
        );
    }
  }

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        {children}
        <DrawerContent
          className={`${
            view === "note" ? "h-[70svh]" : "min-h-[60svh]"
          } flex flex-col gap-6 items-center px-6 lg:p-12 overflow-y-auto no-scrollbar rounded-xl border-none`}
        >
          <DrawerHeader className="w-full p-0">
            {mapViewToHeader()}
          </DrawerHeader>
          {isFileUploading || isWebsiteUploading || isYoutubeUploading ? (
            <div className="w-full h-[200px] flex flex-col gap-4 items-center justify-center">
              <Skeleton className="h-full w-full rounded-xl bg-violet-400" />
            </div>
          ) : (
            <div
              className="w-full flex flex-col gap-8 no-scrollbar"
              ref={contentRef}
            >
              {mapViewToContent()}
            </div>
          )}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        {children}

        <DialogContent
          hideClose
          aria-describedby={undefined}
          className="max-w-[80vw] min-h-[70vh] flex flex-col gap-6 items-center px-6 lg:p-12 overflow-y-auto no-scrollbar rounded-xl border-none"
        >
          <DialogHeader className="w-full mx-auto flex flex-row justify-between items-center lg:items-start">
            {mapViewToHeader()}
            <div
              className="cursor-pointer rounded-sm opacity-50 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
              onClick={handleClose}
            >
              <X size={24} />
              <span>esc</span>
            </div>
          </DialogHeader>
          {isFileUploading || isWebsiteUploading || isYoutubeUploading ? (
            <div className="w-full h-[200px] flex flex-col gap-4 items-center justify-center">
              <Skeleton className="h-full w-full rounded-xl" />
            </div>
          ) : (
            <div
              className="w-full flex flex-col gap-8 no-scrollbar"
              ref={contentRef}
            >
              {mapViewToContent()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
