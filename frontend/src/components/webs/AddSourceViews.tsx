import { ArrowBigRight, Upload } from "lucide-react";
import React, { useState, useRef } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { set } from "lodash";

function UploadFile({
  handleFileUpload,
  setParseObsidianLinks,
}: {
  handleFileUpload: (files: FileList | null) => void;
  setParseObsidianLinks: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [isParsingObsidianLinks, setIsParsingObsidianLinks] = useState(false);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    //handle directory and file drops
    const items = Array.from(e.dataTransfer.items);

    //filter for acceptable file types
    const acceptedFileTypes = [".md", ".txt", ".pdf"];
    const isAcceptedFile = (file: File) =>
      acceptedFileTypes.some((type) => file.name.toLowerCase().endsWith(type));

    //handle both files and folders
    if (items.length > 0) {
      const fileList: File[] = [];

      //process entries recursively to handle folders
      const processEntry = async (entry: any) => {
        if (entry.isFile) {
          //handle file
          const file = await new Promise<File>((resolve) => {
            entry.file((file: File) => {
              resolve(file);
            });
          });

          if (isAcceptedFile(file)) {
            fileList.push(file);
          }
        } else if (entry.isDirectory) {
          //handle directory
          const reader = entry.createReader();
          const entries = await new Promise<any[]>((resolve) => {
            reader.readEntries((entries: any[]) => {
              resolve(entries);
            });
          });

          // process all entries in the directory
          for (const childEntry of entries) {
            await processEntry(childEntry);
          }
        }
      };

      //process all dropped items
      for (const item of items) {
        if (item.kind === "file") {
          const entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : null;

          if (entry) {
            await processEntry(entry);
          } else {
            // fallback for browsers without webkitGetAsEntry
            const file = item.getAsFile();
            if (file && isAcceptedFile(file)) {
              fileList.push(file);
            }
          }
        }
      }

      if (fileList.length > 0) {
        // convert array to FileList-like object
        const dataTransfer = new DataTransfer();
        fileList.forEach((file) => dataTransfer.items.add(file));
        handleFileUpload(dataTransfer.files);
      }
    } else if (e.dataTransfer.files.length > 0) {
      // direct file drop handling (fallback)
      handleFileUpload(e.dataTransfer.files);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div
        className={`w-full h-full bg-muted p-10 rounded-xl border-dashed border-2 transition-colors duration-300 ${
          isDragging
            ? "border-muted-foreground bg-violet-100"
            : "border-slate-400 dark:border-muted-foreground"
        }`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col gap-2 items-center">
          <div>
            <label htmlFor="folder-upload">
              <div className="relative p-4 rounded-full bg-violet-500 cursor-pointer hover:bg-violet-400 dark:bg-violet-500">
                <Upload size={24} color="white" className="cursor-pointer" />
              </div>
            </label>

            {/*hidden input for file selection */}
            <input
              ref={fileInputRef}
              type="file"
              id="file"
              multiple
              accept=".pdf,.txt,.md"
              className="hidden focus-visible:none focus:outline-none"
              onChange={(e) => handleFileUpload(e.target.files)}
            />

            {/*hidden input for folder selection */}
            <input
              ref={folderInputRef}
              type="file"
              id="folder-upload"
              multiple
              className="hidden focus-visible:none focus:outline-none"
              {...({ webkitdirectory: true, directory: true } as any)}
              onChange={(e) => handleFileUpload(e.target.files)}
            />
          </div>
          <div className="text-center">
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight text-muted-foreground">
              Upload sources
            </h3>
            <p className="text-md text-muted-foreground text-center">
              Drag and drop folders or{" "}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-violet-500 cursor-pointer hover:underline"
              >
                choose files
              </button>{" "}
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-start space-y-2">
        <div className="space-y-1">
          <Label
            htmlFor="link-parsing"
            className="font-medium flex items-center"
          ></Label>
          <p className="text-sm text-gray-500">
            Uploading an Obsidian Vault? Check here to preserve the links.
          </p>
        </div>
        <Switch
          className="border"
          id="link-parsing"
          defaultChecked={false}
          checked={isParsingObsidianLinks}
          onCheckedChange={(checked) => {
            setIsParsingObsidianLinks(checked);
            setParseObsidianLinks(checked);
          }}
        />
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

export { UploadFile, UploadWebsite, UploadYoutube };
