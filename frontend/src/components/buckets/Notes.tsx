import React, { useEffect, ChangeEvent, useCallback, DragEvent } from "react";
import ReactMarkdown, { Components } from "react-markdown";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "date-fns";
import { SourceAsNode } from "@/types/source";
import { useUploadImageToSource } from "@/hooks/sources";
import { Loader2 } from "lucide-react";

interface NoteComponentProps {
  content?: string;
  bucketId: string;
  isOwner?: boolean;
  source: SourceAsNode | null;
  handleNoteContentChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  updateError?: string;
}

interface LoadingImage {
  id: string;
  name: string;
}

const NoteComponent: React.FC<NoteComponentProps> = ({
  content,
  isOwner = false,
  source,
  handleNoteContentChange,
  updateError,
  bucketId,
}) => {
  const [editing, setEditing] = React.useState<boolean>(false);
  const [isDragging, setIsDragging] = React.useState<boolean>(false);
  const [_, setLoadingImages] = React.useState<LoadingImage[]>([]);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const {
    mutateAsync: uploadImages,
    isPending: addingImages,
    error: uploadError,
  } = useUploadImageToSource();

  const insertTextAtCursor = (textToInsert: string): void => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end);

    const newText = `${before}${textToInsert}${after}`;
    textarea.value = newText;

    const event = new Event("input", { bubbles: true });
    textarea.dispatchEvent(event);

    textarea.selectionStart = textarea.selectionEnd =
      start + textToInsert.length;

    handleNoteContentChange({
      target: { value: newText },
    } as ChangeEvent<HTMLTextAreaElement>);
  };

  const handleFileUpload = async (files: File[]) => {
    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (imageFiles.length === 0) return;

    // add loading placeholders
    const newLoadingImages = imageFiles.map((file) => ({
      id: Math.random().toString(36).substring(7),
      name: file.name,
    }));
    setLoadingImages((prev) => [...prev, ...newLoadingImages]);

    // insert loading placeholders in the text
    const loadingPlaceholders = newLoadingImages
      .map((img) => `![Uploading ${img.name}...](loading-${img.id})\n`)
      .join("");
    insertTextAtCursor(loadingPlaceholders);

    try {
      const uploadedUrls = await uploadImages({
        sourceId: bucketId,
        files: imageFiles,
      });

      // replace loading placeholders with actual images
      if (textareaRef.current) {
        let newContent = textareaRef.current.value;
        newLoadingImages.forEach((img, index) => {
          newContent = newContent.replace(
            `![Uploading ${img.name}...](loading-${img.id})`,
            `![Image](${uploadedUrls[index]})`
          );
        });

        handleNoteContentChange({
          target: { value: newContent },
        } as ChangeEvent<HTMLTextAreaElement>);
      }
    } catch (error) {
      console.error("Failed to upload images:", error);

      // remove failed upload placeholders
      if (textareaRef.current) {
        let newContent = textareaRef.current.value;
        newLoadingImages.forEach((img) => {
          newContent = newContent.replace(
            `![Uploading ${img.name}...](loading-${img.id})\n`,
            ""
          );
        });
        handleNoteContentChange({
          target: { value: newContent },
        } as ChangeEvent<HTMLTextAreaElement>);
      }
    } finally {
      // remove loading states
      setLoadingImages((prev) =>
        prev.filter((img) => !newLoadingImages.find((n) => n.id === img.id))
      );
    }
  };

  const fetchAndUploadImage = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const filename = url.split("/").pop() || "image";
      const file = new File([blob], filename, { type: blob.type });
      return await handleFileUpload([file]);
    } catch (error) {
      console.error("Failed to fetch and upload image:", error);
      return null;
    }
  };

  //custom ReactMarkdown renderer for images
  const MarkdownComponents: Components = {
    img: ({ node, ...props }) => {
      const src = props.src || "";
      // check if this is a loading image
      if (src.startsWith("loading-")) {
        const imageId = src.replace("loading-", "");
        return (
          <span className="inline-flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {props.alt}
          </span>
        );
      }

      return <img alt="" {...props} className="max-w-full h-auto" />;
    },
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    // handle files if present
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await handleFileUpload(files);
      return;
    }

    // handle HTML content (for images dragged from web pages)
    const htmlContent = e.dataTransfer.getData("text/html");
    if (htmlContent) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, "text/html");
      const images = doc.getElementsByTagName("img");

      for (const img of Array.from(images)) {
        const imageUrl = img.src;
        if (imageUrl) {
          await fetchAndUploadImage(imageUrl);
        }
      }
      return;
    }

    // handle plain text URLs
    const textContent = e.dataTransfer.getData("text/plain");
    if (textContent && textContent.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      await fetchAndUploadImage(textContent);
    }
  };

  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (!textareaRef.current?.contains(document.activeElement)) return;

      for (const item of Array.from(e.clipboardData?.items ?? [])) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();

          const file = item.getAsFile();
          if (!file) continue;

          await handleFileUpload([file]);
        }
      }
    };
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, []);

  const handleTextAreaInput = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const renderContent = (): JSX.Element => {
    if (isOwner && (editing || !content?.trim())) {
      return (
        <Textarea
          ref={textareaRef}
          value={content}
          placeholder="Content... (Supports Markdown)"
          rows={20}
          className={`mt-4 w-full h-full bg-transparent p-0 text-lg leading-relaxed resize-none focus:outline-none border-none bg-none p-0 ring-offset-none focus-visible:ring-0 focus-visible:ring-offset-0 text-lg font-normal resize-none text-sm text-foreground`}
          onInput={handleTextAreaInput}
          onChange={handleNoteContentChange}
          onBlur={() => {
            if (content?.trim()) {
              setEditing(false);
            }
          }}
        />
      );
    }

    return (
      <div
        className="h-full prose dark:prose-invert max-w-none mt-4"
        onClick={() => setEditing(true)}
      >
        <ReactMarkdown components={MarkdownComponents}>
          {content || ""}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <ScrollArea
      className={`h-[calc(100vh-210px)] pr-4 ${
        isOwner && editing && isDragging ? "border-4 border-dashed" : ""
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <small className="text-muted-foreground">
        {formatDate(
          new Date(source ? source.updated + "Z" : ""),
          "MMMM dd, yyyy hh:mm a"
        )}
      </small>
      {renderContent()}
      {updateError && <p className="text-red-500">{updateError}</p>}
    </ScrollArea>
  );
};

export default NoteComponent;
