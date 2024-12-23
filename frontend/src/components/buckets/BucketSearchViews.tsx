import { ArrowBigRight, Forward, Upload } from "lucide-react";
import React from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { ScrollArea } from "../ui/scroll-area";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
function UploadFile({
  handleFileUpload,
}: {
  handleFileUpload: (file: File | null) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="w-full h-full bg-muted p-10 rounded-xl border-dashed border-2 border-slate-400">
        <div className="flex flex-col gap-2 items-center">
          <div>
            <label htmlFor="file">
              <div className="relative p-4 rounded-full bg-slate-400 cursor-pointer hover:bg-slate-500">
                <Upload size={24} color="white" className="cursor-pointer" />
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
                handleFileUpload(e.target.files ? e.target.files[0] : null)
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
                  handleFileUpload(e.target.files ? e.target.files[0] : null)
                }
              />
              to upload
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function UploadWebsite({
  websiteUrl,
  handleWebsiteUrlChange,
  handleWebsiteUpload,
  isWebsiteUploading,
}: {
  websiteUrl: string;
  handleWebsiteUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleWebsiteUpload: (url: string) => void;
  isWebsiteUploading: boolean;
}) {
  return (
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
  );
}

function UploadYoutube({
  youtubeUrl,
  handleYoutubeUrlChange,
  handleYoutubeUpload,
  isYoutubeUploading,
}: {
  youtubeUrl: string;
  handleYoutubeUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleYoutubeUpload: (url: string) => void;
  isYoutubeUploading: boolean;
}) {
  return (
    <div className="flex flex-row gap-4">
      <Input
        placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        onChange={handleYoutubeUrlChange}
      />
      <Button
        disabled={isYoutubeUploading || youtubeUrl.length < 5}
        onClick={() => handleYoutubeUpload(youtubeUrl)}
      >
        <ArrowBigRight size={20} />
      </Button>
    </div>
  );
}

function UploadNote({
  onTitleChange,
  onDescriptionChange,
  onSubmit,
  isNoteUploading,
}: {
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDescriptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: SubmitHandler<{
    title: string;
    content?: string | undefined;
  }>;
  isNoteUploading: boolean;
}) {
  const noteSchema = z.object({
    title: z.string().min(1, { message: "Title is required" }),
    content: z.string().optional(),
  });

  type noteType = z.infer<typeof noteSchema>;

  const form = useForm<noteType>({
    resolver: zodResolver(noteSchema),
  });

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="grid w-full items-start gap-6"
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
  );
}

export { UploadFile, UploadWebsite, UploadYoutube, UploadNote };
