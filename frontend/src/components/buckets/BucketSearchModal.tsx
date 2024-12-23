import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { BucketConfigFormValues } from "@/types/article";
import { Bucket } from "@/types/bucket";
import {
  useFileUpload,
  useUploadNote,
  useUploadWebsite,
  useUploadYoutube,
} from "@/hooks/sources";
import { toast } from "../ui/use-toast";
import gsap from "gsap";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ScrollArea } from "../ui/scroll-area";
import { Uploading } from "../utility/Loading";
import { extractVideoId } from "@/lib/utils";
import { DialogTitle } from "@radix-ui/react-dialog";
import {
  UploadFile,
  UploadNote,
  UploadWebsite,
  UploadYoutube,
} from "./BucketSearchViews";
import { Drawer, DrawerContent, DrawerHeader } from "../ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

type ConfigGraphModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  config: BucketConfigFormValues;
  setConfig: (value: BucketConfigFormValues) => void;
  bucket: Bucket;
  refreshSources: () => void;
  refreshBucket: () => void;
  view?: string;
  children: React.ReactNode;
};

export default function BucketSearchModal({
  bucket,
  open,
  setOpen,
  view = "default",
  children,
  refreshSources,
  refreshBucket,
}: ConfigGraphModalProps) {
  const noteSchema = z.object({
    title: z.string().min(1, { message: "Title is required" }),
    content: z.string().optional(),
  });

  type noteType = z.infer<typeof noteSchema>;

  const isMobile = useIsMobile();
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [note, setNote] = useState({
    title: "",
    content: "",
  });

  const {
    mutateAsync: uploadFile,
    error,
    isPending: isFileUploading,
  } = useFileUpload(bucket.userId, bucket.bucketId, "document");

  const {
    mutateAsync: uploadWebsite,
    error: websiteUploadError,
    isPending: isWebsiteUploading,
  } = useUploadWebsite(bucket.bucketId);

  const {
    mutateAsync: uploadNote,
    error: noteError,
    isPending: isNoteUploading,
  } = useUploadNote(bucket.bucketId);

  const {
    mutateAsync: uploadYoutube,
    error: youtubeError,
    isPending: isYoutubeUploading,
  } = useUploadYoutube(bucket.bucketId);

  const contentRef = useRef(null);

  const onTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value === "") {
      setNote({
        ...note,
        title: "Untitled",
      });
      return;
    }
    setNote({
      ...note,
      title: event.target.value,
    });
  };

  const onDescriptionChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setNote({
      ...note,
      content: event.target.value,
    });
  };

  const onSubmit: SubmitHandler<noteType> = async (data) => {
    try {
      const noteId = await uploadNote({
        title: note.title,
        content: note.content,
      });
      form.reset();
      handleClose();
      refreshSources();
      refreshBucket();
    } catch (error: any) {
      toast({
        title: "Error creating bucket",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const form = useForm<noteType>({
    resolver: zodResolver(noteSchema),
  });

  const handleFileUpload = async (file: File | null) => {
    if (!file) {
      return;
    }
    try {
      const result = await uploadFile(file);
      toast({
        title: "File uploaded",
        description: "File uploaded successfully",
        duration: 500,
      });
      handleClose();
      refreshSources();
      refreshBucket();
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error uploading file",
      });
    }
  };

  const handleWebsiteUpload = async (url: string) => {
    try {
      const result = await uploadWebsite(url);
      toast({
        title: "Website uploaded",
        description: "Website uploaded successfully",
        duration: 500,
      });
      handleClose();
      refreshSources();
      refreshBucket();
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
      const result = await uploadYoutube(videoId as string);
      toast({
        title: "Uploaded",
        description: "Youtube video uploaded successfully",
        duration: 500,
      });
      handleClose();
      refreshSources();
      refreshBucket();
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
        return <UploadFile handleFileUpload={handleFileUpload} />;
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
      case "note":
        return (
          <UploadNote
            isNoteUploading={isNoteUploading}
            onTitleChange={onTitleChange}
            onDescriptionChange={onDescriptionChange}
            onSubmit={onSubmit}
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
              Files are the building blocks of knowledge. Upload them here. Only
              PDFs are supported at the moment and are limited to 4 MB.
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
      case "note":
        return (
          <div className="space-y-2">
            <DialogTitle className="scroll-m-20 text-2xl lg:text-3xl font-extrabold tracking-tight lg:text-6xl text-left">
              <span> Add Note</span>
            </DialogTitle>
            <p className="text-sm max-w-full md:max-w-lg lg:text-md text-muted-foreground text-left">
              It isn&apos;t about the answers, it&apos;s the steps that will get
              you there.
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
          {isFileUploading || isWebsiteUploading || isNoteUploading ? (
            <div className="w-full h-[200px] flex flex-col gap-4 items-center justify-center">
              <Uploading />
              <p className="text-sm text-center">Uploading...</p>
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
    <Dialog open={open} onOpenChange={setOpen}>
      {children}
      <DialogContent
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
        {isFileUploading || isWebsiteUploading || isNoteUploading ? (
          <div className="w-full h-[200px] flex flex-col gap-4 items-center justify-center">
            <Uploading />
            <p className="text-sm text-center">Uploading...</p>
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
  );
}
