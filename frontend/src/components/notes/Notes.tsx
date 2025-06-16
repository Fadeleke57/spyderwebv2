import React, {
  useState,
  useRef,
  useEffect,
  ChangeEvent,
  DragEvent,
  useCallback,
} from "react";
import ReactMarkdown from "react-markdown";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { SourceAsNode } from "@/types/source";
import { useUpdateNote, useUploadImageToSource } from "@/hooks/sources";
import { MarkdownComponents } from "./MarkdownComponents";
import { debounce } from "lodash";
import { toast } from "../ui/use-toast";

interface NoteComponentProps {
  webId: string;
  isOwner: boolean;
  source: SourceAsNode | null;
}

interface LoadingImage {
  id: string;
  name: string;
}

const NoteComponent: React.FC<NoteComponentProps> = ({
  isOwner = false,
  source,
  webId,
}) => {
  const [localContent, setLocalContent] = useState<string>(
    source?.content || ""
  );

  const {
    mutateAsync: updateNote,
    isPending: isNoteUpdating,
    error: noteUpdatingError,
  } = useUpdateNote(webId, source?.sourceId || "");

  const debouncedSave = useCallback(
    debounce(async (newContent: string) => {
      try {
        await updateNote({
          content: newContent,
        });
        toast({ title: "Changes saved." });
      } catch (err) {
        console.error("Failed to update note:", err);
      }
    }, 1000),
    [updateNote]
  );

  const handleNoteContentChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    // for notes only
    const newContent = e.target.value;
    if (newContent.length < 3) {
      setLocalContent(newContent);
      return;
    }
    setLocalContent(newContent);
    debouncedSave(newContent);
  };

  //separate state for edit mode and local content
  const [mode, setMode] = useState<"edit" | "preview">(
    localContent ? "preview" : "edit"
  );

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [loadingImages, setLoadingImages] = useState<LoadingImage[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    mutateAsync: uploadImages,
    isPending: addingImages,
    error: uploadImageError,
  } = useUploadImageToSource();

  //sync localContent when prop content changes
  useEffect(() => {
    setLocalContent(localContent);
  }, [localContent]);

  //auto-resize textarea
  useEffect(() => {
    if (mode === "edit" && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;

      //focus the textarea when switching to edit mode
      textareaRef.current.focus();
    }
  }, [mode, localContent]);

  const handleLocalContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setLocalContent(newContent);

    //propagate changes to parent while staying in edit mode
    handleNoteContentChange(e);

    //auto-resize
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

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

    //create synthetic event to update state
    const event = {
      target: { value: newText },
    } as ChangeEvent<HTMLTextAreaElement>;

    handleLocalContentChange(event);

    //set cursor position after inserted text
    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd =
          start + textToInsert.length;
      }
    }, 0);
  };

  const handleFileUpload = async (files: File[]) => {
    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (imageFiles.length === 0) return;

    //add loading placeholders
    const newLoadingImages = imageFiles.map((file) => ({
      id: Math.random().toString(36).substring(7),
      name: file.name,
    }));
    setLoadingImages((prev) => [...prev, ...newLoadingImages]);

    //insert loading placeholders in the text
    const loadingPlaceholders = newLoadingImages
      .map((img) => `![Uploading ${img.name}...](loading-${img.id})\n`)
      .join("");
    insertTextAtCursor(loadingPlaceholders);

    try {
      const uploadedUrls = await uploadImages({
        sourceId: webId,
        files: imageFiles,
      });

      //replace loading placeholders with actual images
      if (textareaRef.current) {
        let newContent = textareaRef.current.value;
        newLoadingImages.forEach((img, index) => {
          newContent = newContent.replace(
            `![Uploading ${img.name}...](loading-${img.id})`,
            `![Image](${uploadedUrls[index]})`
          );
        });

        const event = {
          target: { value: newContent },
        } as ChangeEvent<HTMLTextAreaElement>;

        handleLocalContentChange(event);
      }
    } catch (error) {
      console.error("Failed to upload images:", error);

      //remove failed upload placeholders
      if (textareaRef.current) {
        let newContent = textareaRef.current.value;
        newLoadingImages.forEach((img) => {
          newContent = newContent.replace(
            `![Uploading ${img.name}...](loading-${img.id})\n`,
            ""
          );
        });

        const event = {
          target: { value: newContent },
        } as ChangeEvent<HTMLTextAreaElement>;

        handleLocalContentChange(event);
      }
    } finally {
      //remove loading states
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

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (mode !== "edit") {
      setMode("edit");
      // Allow time for mode to change before processing the drop
      setTimeout(() => processDrop(e), 0);
      return;
    }

    processDrop(e);
  };

  const processDrop = async (e: DragEvent<HTMLDivElement>) => {
    //handle files if present
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await handleFileUpload(files);
      return;
    }

    //handle HTML content (for images dragged from web pages)
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

    //handle plain text URLs
    const textContent = e.dataTransfer.getData("text/plain");
    if (textContent && textContent.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      await fetchAndUploadImage(textContent);
    } else if (textContent) {
      //insert plain text at cursor
      insertTextAtCursor(textContent);
    }
  };

  //handle paste events for images
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (
        mode !== "edit" ||
        !textareaRef.current?.contains(document.activeElement)
      )
        return;

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
  }, [mode]);

  const renderContent = () => {
    //for non-owners, or preview mode with content
    if (!isOwner || (mode === "preview" && localContent?.trim())) {
      return (
        <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap break-words">
          <ReactMarkdown components={MarkdownComponents} className="whitespace-pre-wrap">
            {localContent || ""}
          </ReactMarkdown>
        </div>
      );
    }

    //for owners in edit mode, or empty content
    return (
      <Textarea
        ref={textareaRef}
        value={localContent}
        placeholder="Start writing in markdown...click outside to preview"
        rows={20}
        className={`w-full h-full bg-transparent p-0 text-base leading-relaxed resize-none focus:outline-none border-none bg-none ring-offset-none focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground whitespace-pre-wrap break-words`}
        onChange={handleLocalContentChange}
        onFocus={() => setMode("edit")}
        onBlur={() => setMode("preview")}
      />
    );
  };

  return (
    <ScrollArea
      className={`flex-1 pr-4 h-[calc(100vh-160px)] ${
        isOwner && mode === "edit" && isDragging
          ? "border-4 border-dashed border-primary/50"
          : ""
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => {
        if (isOwner && mode === "preview") {
          setMode("edit");
        }
      }}
    >
      {renderContent()}
      {noteUpdatingError && (
        <p className="text-red-500 mt-2">{noteUpdatingError}</p>
      )}
      {uploadImageError && (
        <p className="text-red-500 mt-2">Image upload failed</p>
      )}
    </ScrollArea>
  );
};

export default NoteComponent;
