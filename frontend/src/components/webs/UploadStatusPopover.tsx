import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  X,
  Check,
  Upload,
  Copy,
  ChevronUp,
  CircleArrowUp,
  Loader,
  NotepadText,
} from "lucide-react";
import { useSourceStore } from "@/store/sourceStore";
import { useRouter } from "next/router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "../ui/kibo-ui/dropzone";
import { Input } from "../ui/input";
import {
  useFetchSourcesForWeb,
  useFileUpload,
  useUploadNote,
  useUploadWebsite,
  useUploadYoutube,
} from "@/hooks/sources";
import { toast } from "../ui/use-toast";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { useFetchWebById } from "@/hooks/webs";
import { extractVideoId, getLinkType } from "@/lib/utils";
import VoiceRecordModal from "./VoiceRecordModal";
import { useResourceUsage } from "@/hooks/usage";
import { useUser } from "@/providers/UserProvider";
import { useIsMobile } from "@/hooks/use-mobile";
import { Drawer, DrawerContent } from "../ui/drawer";

interface UploadItem {
  id: number;
  name: string;
  type: string;
  status: "completed" | "uploading" | "failed" | "skipped";
  progress?: number;
  destination: string;
}

const tabs = [
  { key: "all", label: "All uploads" },
  { key: "completed", label: "Completed" },
  { key: "skipped", label: "Skipped" },
  { key: "failed", label: "Failed" },
];

function UploadStatusPopover() {
  const router = useRouter();
  const { webId } = router.query;
  const { user } = useUser();
  const isMobile = useIsMobile();

  const [view, setView] = useState<"upload" | "status">("upload");
  const [activeTab, setActiveTab] = useState("all");
  const [linkUserInput, setLinkUserInput] = useState("");
  const [parseObsidianLinks, setParseObsidianLinks] = useState(false);
  const { data: usage, isLoading: isUsageLoading } = useResourceUsage(
    user && user.id
  );
  const [_, setOpen] = useState(false);

  const {
    setSelectedSourceId,
    setIsWebDataModalOpen,
    isUploadingSource,
    setIsUploadingSource,
  } = useSourceStore();

  const { mutateAsync: createEmptyNote, isPending: isNoteUploading } =
    useUploadNote(webId as string);
  const { mutateAsync: uploadYoutubeVideo, isPending: isYoutubeUploading } =
    useUploadYoutube(webId as string);
  const { mutateAsync: uploadWebsite, isPending: isWebsiteUploading } =
    useUploadWebsite(webId as string);
  const { mutateAsync: uploadFile, isPending: isFileUploading } = useFileUpload(
    webId as string
  );
  const { refetch: refetchSources } = useFetchSourcesForWeb(webId as string);
  const { refetch: refetchWeb } = useFetchWebById(webId as string);
  console.log("isUploadingSource", isUploadingSource);
  const isLinkUploading = isYoutubeUploading || isWebsiteUploading;
  const handleLinkUpload = async () => {
    if (!linkUserInput.trim()) {
      toast({ variant: "destructive", title: "Please enter a URL." });
      return;
    }
    const cleanedInput = linkUserInput
      .trim()
      .replace(/^(https?:\/\/)?(www\.)?/i, "");
    if (!cleanedInput) {
      toast({ variant: "destructive", title: "Invalid URL format." });
      return;
    }
    const finalUrl = `https://` + cleanedInput;
    const type = getLinkType(finalUrl);

    setIsUploadingSource(true);
    let sourceId;
    try {
      if (type === "youtube") {
        const videoId = extractVideoId(finalUrl);
        if (!videoId) {
          toast({
            variant: "destructive",
            title: "Invalid YouTube URL",
            description: "Please enter a valid YouTube video URL.",
          });
          return;
        }
        const { result, transcripts_found } = await uploadYoutubeVideo(videoId);
        sourceId = result;
        toast({
          title: `${transcripts_found ? "Transcripts found." : "No transcripts found."}`,
          description: `${transcripts_found ? "Processing will begin shortly." : "Video saved but transcripts will not be processed."}`,
        });
        setSelectedSourceId(sourceId);
        setIsWebDataModalOpen(true);
      } else if (type === "website") {
        sourceId = await uploadWebsite(finalUrl);
        toast({
          title: "Website uploaded",
          description: "Processing will begin shortly.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Invalid or unsupported URL",
          description: "Please enter a valid website or YouTube URL.",
        });
        return;
      }
      setLinkUserInput("");
      setView("status");
    } catch (error: any) {
      console.error(`${type} link upload error:`, error);
      toast({
        variant: "destructive",
        title: `Error submitting ${type} link`,
        description: "This website may not be supported.",
      });
    } finally {
      if (sourceId) {
        setSelectedSourceId(sourceId);
        setIsWebDataModalOpen(true);
        refetchWeb();
        refetchSources();
      }
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }
    if (
      usage &&
      usage.storage_limit &&
      usage.storage_used > usage.storage_limit
    ) {
      toast({
        variant: "destructive",
        title: "Storage limit reached",
        description: "Please upgrade your plan to continue uploading files.",
      });
      return;
    }
    try {
      if (files.length > 1) {
        await uploadFile({
          files: files,
          parseObsidianLinks,
        });
        toast({
          title: "Multiple files uploaded.",
          description: "Processing...",
        });
        setView("status");
        refetchWeb();
        setIsMinimized(true);
        setIsUploadingSource(false);
        setView("status");
      } else {
        try {
          const { firstSourceId: sourceId } = await uploadFile({
            files: files,
            parseObsidianLinks: false,
          });
          refetchSources();
          refetchWeb();
          setSelectedSourceId(sourceId);
          setIsWebDataModalOpen(true);
          toast({ title: "File uploaded successfully!" });
          setView("status");
        } catch (error: any) {
          console.error(error);
        }
      }
    } catch (err: any) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error uploading file(s)",
        description: err.message || "An unexpected error occurred.",
      });
    }
  };

  const [isMinimized, setIsMinimized] = useState(false);

  const uploads: UploadItem[] = [
    {
      id: 1,
      name: "Farouk Adeleke Resume",
      type: "PDF",
      status: "completed",
      destination: "Files",
    },
    {
      id: 2,
      name: "Project Proposal.docx",
      type: "DOCX",
      status: "uploading",
      progress: 65,
      destination: "Documents",
    },
    {
      id: 3,
      name: "Design Assets.zip",
      type: "ZIP",
      status: "failed",
      destination: "Files",
    },
    {
      id: 4,
      name: "Another Asset.zip",
      type: "ZIP",
      status: "failed",
      destination: "Files",
    },
    {
      id: 5,
      name: "Yet Another.zip",
      type: "ZIP",
      status: "failed",
      destination: "Files",
    },
  ];

  const getStatusIcon = (
    status: "completed" | "uploading" | "failed" | "skipped"
  ) => {
    switch (status) {
      case "completed":
        return <Check className="w-4 h-4 text-green-500" />;
      case "uploading":
        return <Upload className="w-4 h-4 text-blue-500 animate-pulse" />;
      case "failed":
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getFilteredUploads = (activeTabKey: string) => {
    switch (activeTabKey) {
      case "completed":
        return uploads.filter((upload) => upload.status === "completed");
      case "skipped":
        return uploads.filter((upload) => upload.status === "skipped");
      case "failed":
        return uploads.filter((upload) => upload.status === "failed");
      default:
        return uploads;
    }
  };

  const completedCount = uploads.filter((u) => u.status === "completed").length;

  const header = (
    <div className="flex items-center justify-between p-4 border-b w-full">
      <div className="flex w-full items-center justify-between gap-2">
        <h3 className="text-lg font-medium">Uploads</h3>
        <div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-muted-foreground hover:text-foreground h-fit w-fit p-1"
          >
            {isMinimized ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsUploadingSource(false)}
            className="text-muted-foreground hover:text-foreground h-fit w-fit p-1 transition-all duration-200 ease-in-out"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  const footer = (
    <div className="bg-emerald-700 text-white p-2 text-sm m-4 rounded-lg flex items-center gap-3">
      <div className="bg-white rounded-full p-1">
        <Check className="w-4 h-4 text-emerald-800" />
      </div>
      <div className="flex-1">
        <div className="font-medium">Upload successful!</div>
        <div className="text-sm opacity-90">
          {completedCount} upload complete
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setView("upload")}
        className="text-white emerald-700 transition-all duration-200 ease-in-out hover:bg-emerald-800 px-3 py-1 text-sm border"
      >
        Add <ChevronDown className="w-3 h-3 ml-1" />
      </Button>
    </div>
  );

  const uploadContent = (
    <div className="h-[390px] flex flex-col gap-2 p-2 pt-4">
      {isFileUploading ? (
        <div className="flex items-center justify-center h-full">
          <Loader size={24} className="animate-spin text-violet-400/50" />
        </div>
      ) : (
        <Dropzone
          onDrop={(acceptedFiles: File[]) => {
            if (acceptedFiles && acceptedFiles.length > 0) {
              const dataTransfer = new DataTransfer();
              acceptedFiles.forEach((file) => dataTransfer.items.add(file));
              handleFileUpload(dataTransfer.files);
            } else {
              handleFileUpload(null);
            }
          }}
          accept={{
            pdf: [".pdf"],
            markdown: [".md"],
            txt: [".txt", ".md"],
          }}
          maxFiles={10}
          onError={(err) => {
            console.error("Dropzone error:", err);
            toast({
              variant: "destructive",
              title: "Error during file drop",
            });
          }}
        >
          <DropzoneEmptyState />
          {isFileUploading ? (
            <Loader size={16} className="animate-spin" />
          ) : (
            <DropzoneContent />
          )}
        </Dropzone>
      )}

      <div className="flex flex-row items-center justify-between p-2">
        <div className="space-y-1">
          <Label
            htmlFor="link-parsing-popover"
            className="font-medium flex items-center"
          >
            Parse Obsidian Links
          </Label>
          <p className="text-sm max-w-[250px] text-muted-foreground">
            Turn on to preserve links if uploading an Obsidian Vault.
          </p>
        </div>
        <Switch
          className="border"
          id="link-parsing-popover"
          checked={parseObsidianLinks}
          onCheckedChange={setParseObsidianLinks}
        />
      </div>

      <div>
        {" "}
        <span className="text-sm text-muted-foreground">
          Add a website or youtube video
        </span>
        <div className="flex items-center mt-2">
          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-sm text-muted-foreground h-10">
            https://
          </span>
          <Input
            type="text"
            placeholder="example.com or youtube.com/watch?v=..."
            value={linkUserInput}
            onChange={(e) =>
              setLinkUserInput(e.target.value.replace("https://", ""))
            }
            disabled={isLinkUploading || isFileUploading}
            className="rounded-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0 transition-none h-10 flex-1 min-w-0"
          />
          <Button
            onClick={handleLinkUpload}
            disabled={
              isLinkUploading || isFileUploading || !linkUserInput.trim()
            }
            className="border dark:bg-violet-400/40 dark:border-violet-200 dark:hover:bg-violet-400/60 rounded-l-none h-10 px-3"
          >
            {isLinkUploading ? (
              <Loader size={16} className="animate-spin" />
            ) : (
              <CircleArrowUp size={16} />
            )}
          </Button>
        </div>
      </div>
      <div>
        <span className="text-sm text-muted-foreground">
          Create a note or add a voice note
        </span>
        <div className="flex mt-2 items-center gap-2">
          <Button
            className="border dark:bg-violet-400/40 dark:border-violet-200 dark:hover:bg-violet-400/60 p-1 rounded-full"
            size={"icon"}
            disabled={isNoteUploading}
            onClick={async () => {
              try {
                const sourceId = await createEmptyNote({
                  title: "Untitled Note",
                  content: "",
                });
                setSelectedSourceId(sourceId);
                refetchSources();
                refetchWeb();
                setIsWebDataModalOpen(true);
                setIsUploadingSource(false);
              } catch (error) {
                toast({
                  variant: "destructive",
                  title: "Failed to create note.",
                });
              }
            }}
          >
            {isNoteUploading ? (
              <Loader className="animate-spin" size={16} />
            ) : (
              <NotepadText size={16}></NotepadText>
            )}
          </Button>
          <VoiceRecordModal />
        </div>
      </div>
    </div>
  );

  const statusContent = (
    <Tabs
      defaultValue="all"
      value={activeTab}
      className="flex flex-col gap-2 p-4 pb-2 h-[350px]"
    >
      <TabsList>
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.key}
            value={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`text-sm`}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="px-4 py-2">
        <div className="text-sm text-muted-foreground mb-3">
          Uploading to <span className="underline cursor-pointer">Files</span>
        </div>
        {tabs.map((tab) => (
          <TabsContent key={tab.key} value={tab.key}>
            <ScrollArea className="h-64">
              {getFilteredUploads(activeTab).map((upload) => (
                <div key={upload.id} className="flex mb-4 items-start gap-3">
                  <div className="mt-1">{getStatusIcon(upload.status)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-foreground truncate">
                        {upload.name}
                      </h4>
                      {upload.status === "completed" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-foreground p-1 ml-2"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {upload.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {upload.status === "completed" &&
                          `Uploaded to ${upload.destination}`}
                        {upload.status === "uploading" &&
                          `${upload.progress}% complete`}
                        {upload.status === "failed" && "Upload failed"}
                      </span>
                    </div>

                    {upload.status === "uploading" &&
                      upload.progress !== undefined && (
                        <div className="w-full bg-muted rounded-full h-1 mt-2">
                          <div
                            className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${upload.progress}%` }}
                          />
                        </div>
                      )}
                  </div>
                </div>
              ))}
              <ScrollBar />
            </ScrollArea>
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );

  if (isMobile) {
    return (
      <Drawer
        onClose={() => {
          setOpen(false);
          setIsUploadingSource(false);
        }}
        open={isUploadingSource}
        onOpenChange={setOpen}
      >
        <DrawerContent className="h-[85dvh] px-4">
          {header}
          {uploadContent}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <div
      className={`absolute bottom-4 right-12 w-[400px] text-xs p-2 bg-background text-foreground border rounded-lg shadow-xl transition-opacity ease-in duration-150 z-50 ${
        isUploadingSource
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
    >
      {header}
      {!isMinimized && uploadContent}
    </div>
  );

  // view === "status"
  {
    /**

  return (
    <
      className={`relative w-96 text-xs p-2 bg-background text-foreground border rounded-lg shadow-xl opacity-0 ${isUploadingSource && "opacity-100"} transition-opacity ease-in duration-300`}
    >
      {header}
      {!isMinimized && statusContent}
      {!isMinimized &&
        uploads.some((u) => u.status === "completed") &&
        footer}{" "}
  );
     */
  }
}

export default UploadStatusPopover;
