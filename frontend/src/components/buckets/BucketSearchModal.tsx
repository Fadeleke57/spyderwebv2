import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowBigRight,
  Forward,
  Link,
  Notebook,
  Plus,
  Upload,
  X,
  Youtube,
} from "lucide-react";
import { BucketConfigFormValues } from "@/types/article";
import { Bucket } from "@/types/bucket";
import {
  useFileUpload,
  useUploadNote,
  useUploadWebsite,
} from "@/hooks/sources";
import { toast } from "../ui/use-toast";
import gsap from "gsap";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ScrollArea } from "../ui/scroll-area";
import { waveform } from "ldrs";
import { Uploading } from "../utility/Loading";

type ConfigGraphModalProps = {
  config: BucketConfigFormValues;
  setConfig: (value: BucketConfigFormValues) => void;
  bucket: Bucket;
  refetch: () => void;
  view?: string;
  children: React.ReactNode;
};

export default function BucketSearchModal({
  bucket,
  refetch,
  view = "default",
  children,
}: ConfigGraphModalProps) {
  const noteSchema = z.object({
    title: z.string().min(1, { message: "Title is required" }),
    content: z.string().optional(),
  });

  type noteType = z.infer<typeof noteSchema>;
  const [isOpen, setIsOpen] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [note, setNote] = useState({
    title: "",
    content: "",
  });

  const {
    uploadFile,
    progress,
    error,
    isUploading: isFileUploading,
  } = useFileUpload(bucket.userId, bucket.bucketId);

  const {
    uploadWebsite,
    progress: websiteProgress,
    error: websiteError,
    isUploading: isWebsiteUploading,
  } = useUploadWebsite(bucket.bucketId);

  const {
    uploadNote,
    progress: noteLoading,
    error: noteError,
    isUploading: isNoteUploading,
  } = useUploadNote(bucket.bucketId);

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
      refetch();
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
    console.log("file", file);
    const fileType = "document";
    try {
      const result = await uploadFile(file, fileType);
      toast({
        title: "File uploaded",
        description: "File uploaded successfully",
        duration: 500,
      });
      handleClose();
      refetch();
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
      refetch();
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

  const handleWebsiteUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWebsiteUrl(e.target.value);
  };

  const handleClose = () => {
    setIsOpen(false);
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        aria-describedby="description"
        className="max-w-[80vw] min-h-[70vh] flex flex-col gap-6 items-center px-6 lg:p-12 overflow-y-auto no-scrollbar rounded-xl"
      >
        <DialogHeader className="w-full mx-auto flex flex-row justify-between items-center lg:items-start">
          <div className="space-y-4">
            <h1 className="scroll-m-20 text-2xl lg:text-3xl font-extrabold tracking-tight lg:text-6xl text-left">
              Upload {view === "default" && <span>File</span>}
              {view === "website" && (
                <span className="text-blue-500">Website</span>
              )}
              {view === "youtube" && (
                <span className="text-red-500">YouTube</span>
              )}
              {view === "note" && <span className="text-green-500">Note</span>}
            </h1>
            <p className="text-sm max-w-[200px] md:max-w-lg lg:text-md text-muted-foreground text-left">
              It isn&apos;t about the answers, it&apos;s the steps that will get
              you there.
            </p>
          </div>
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
            {view === "default" && (
              <div className="flex flex-col gap-6">
                <div className="w-full h-full bg-muted p-10 rounded-xl border-dashed border-2 border-slate-400">
                  <div className="flex flex-col gap-2 items-center">
                    <div>
                      <label htmlFor="file">
                        <div className="relative p-4 rounded-full bg-slate-400 cursor-pointer hover:bg-slate-500">
                          <Upload
                            size={24}
                            color="white"
                            className="cursor-pointer"
                          />
                        </div>
                      </label>
                      <input
                        type="file"
                        id="file"
                        multiple
                        accept=".pdf"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        hidden
                        onChange={(e) =>
                          handleFileUpload(
                            e.target.files ? e.target.files[0] : null
                          )
                        }
                      />
                    </div>
                    <div className="text-center">
                      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight text-muted-foreground">
                        Upload sources
                      </h3>
                      <p className="text-md text-muted-foreground text-center">
                        Drag and drop or{" "}
                        <label htmlFor="file">
                          <span className="text-blue-500 cursor-pointer">
                            choose file
                          </span>{" "}
                        </label>
                        <input
                          type="file"
                          id="file"
                          multiple
                          accept=".pdf"
                          hidden
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) =>
                            handleFileUpload(
                              e.target.files ? e.target.files[0] : null
                            )
                          }
                        />
                        to upload
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {view === "website" && (
              <div className="flex flex-row gap-4">
                <Input
                  placeholder="https://example.com"
                  onChange={handleWebsiteUrlChange}
                />
                <Button
                  disabled={websiteUrl.length < 5 || isWebsiteUploading}
                  onClick={() => handleWebsiteUpload(websiteUrl)}
                >
                  <ArrowBigRight size={20} />
                </Button>
              </div>
            )}
            {view === "youtube" && (
              <div className="flex flex-row gap-4">
                <Input placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />
                <Button>
                  <ArrowBigRight size={20} />
                </Button>
              </div>
            )}
            {view === "note" && (
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid w-full items-start gap-6 border rounded-lg p-6"
              >
                <ScrollArea className="h-[calc(50vh-80px)]">
                  <fieldset className="grid gap-6 rounded-lg">
                    <div>
                      <div className="flex flex-col space-y-2">
                        <Textarea
                          id="title"
                          rows={1}
                          placeholder="Give it a title..."
                          {...form.register("title")}
                          className="w-full min-h-[2rem] bg-transparent p-0 text-3xl font-bold leading-tight resize-none focus:outline-none border-none bg-none p-0 ring-offset-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none m-0 py-0 text-2xl font-semibold"
                          onInput={(e: any) => {
                            e.target.style.height = "auto";
                            e.target.style.height = `${e.target.scrollHeight}px`;
                            form.trigger("title");
                          }}
                          onChange={(e: any) => onTitleChange(e)}
                          maxLength={200}
                        />
                        <Textarea
                          id="content"
                          rows={1}
                          placeholder="Some ideas, thoughts, or notes..."
                          {...form.register("content")}
                          className="w-full min-h-[1px] bg-transparent p-0 text-lg leading-relaxed resize-none focus:outline-none border-none bg-none p-0 ring-offset-none focus-visible:ring-0 focus-visible:ring-offset-0 text-lg font-normal resize-none text-sm text-muted-foreground"
                          onInput={(e: any) => {
                            e.target.style.height = "auto";
                            e.target.style.height = `${e.target.scrollHeight}px`;
                          }}
                          onChange={(e: any) => onDescriptionChange(e)}
                        />
                      </div>
                    </div>
                    <Button
                      className="absolute bottom-4 right-4 rounded-full"
                      type="submit"
                      disabled={isNoteUploading}
                    >
                      <Forward size={20} />
                    </Button>
                  </fieldset>
                </ScrollArea>
              </form>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
