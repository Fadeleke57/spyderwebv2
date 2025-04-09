import React from "react";
import { Card } from "@/components/ui/card";
import FaviconDisplay from "@/components/utility/FaviconDisplay";
import {
  FileText,
  Youtube,
  FileType,
  Clock,
  Calendar,
  FileIcon,
  Globe,
} from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export interface ReferenceMetadata {
  // Common fields
  sourceId?: string;
  webId?: string;
  text?: string;
  timestamp?: string;
  type?: string;
  url?: string;
  chunkIndex?: number;
  chunkCount?: number;

  // Website specific
  websiteTitle?: string;

  // YouTube specific
  videoTitle?: string;
  videoDescription?: string;
  startTime?: number;
  endTime?: number;

  // Document specific
  documentTitle?: string;
  pageNumber?: number;
  pdfSize?: number;

  // Note specific
  noteTitle?: string;
}

interface ReferencesComponentProps {
  context?: ReferenceMetadata[];
  onReferenceClick?: (reference: ReferenceMetadata) => void;
}

export const formatLinkwithTimeStamp = (url: string, startTime?: number) => {
  if (!startTime) return url;

  const videoId = url.split("v=")[1];
  return `https://www.youtube.com/watch?v=${videoId}&t=${startTime}`;
};

const ReferencesComponent: React.FC<ReferencesComponentProps> = ({
  context = [],
  onReferenceClick,
}) => {
  // If no references, don't render anything
  if (context.length === 0) return null;

  // Format timestamp to a readable date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format video timestamp (seconds) to MM:SS format
  const formatVideoTime = (seconds?: number) => {
    if (seconds === undefined) return "";
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Get icon based on reference type
  const getTypeIcon = (reference: ReferenceMetadata) => {
    const type = reference.type?.toLowerCase();

    if (reference.url && !type?.includes("youtube") && !type?.includes("pdf")) {
      return (
        <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
          <Globe className="w-4 h-4 text-emerald-500" />
        </div>
      );
    }

    switch (type) {
      case "youtube video":
        return (
          <div className="w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <Youtube className="w-4 h-4 text-red-500" />
          </div>
        );
      case "pdf document":
        return (
          <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <FileType className="w-4 h-4 text-blue-500" />
          </div>
        );
      case "note":
        return (
          <div className="w-6 h-6 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
            <FileText className="w-4 h-4 text-amber-500" />
          </div>
        );
      case "website":
        return (
          <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
            <Globe className="w-4 h-4 text-emerald-500" />
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 bg-gray-100 dark:bg-gray-900/30 rounded-full flex items-center justify-center">
            <FileIcon className="w-4 h-4 text-muted-foreground" />
          </div>
        );
    }
  };

  // Extract domain from URL
  const getDomain = (url?: string) => {
    if (!url) return "";
    try {
      const domain = new URL(url).hostname;
      return domain;
    } catch {
      return "";
    }
  };

  // Get text preview (first N characters)
  const getTextPreview = (text?: string, maxLength = 80) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Get reference title based on type
  const getReferenceTitle = (reference: ReferenceMetadata) => {
    const type = reference.type?.toLowerCase();

    if (type === "youtube video") return reference.videoTitle;
    if (type === "pdf document") return reference.documentTitle;
    if (type === "note") return reference.noteTitle;
    if (type === "website")
      return reference.websiteTitle || getDomain(reference.url);

    return getDomain(reference.url) || "Reference";
  };

  // Get source descriptor (domain, page number, timestamp)
  const getSourceDescriptor = (reference: ReferenceMetadata) => {
    const type = reference.type?.toLowerCase();

    if (type === "youtube video" && reference.startTime !== undefined) {
      return null;
    }

    if (type === "pdf document" && reference.pageNumber) {
      return `Page ${reference.pageNumber}`;
    }

    if (reference.url) {
      return getDomain(reference.url);
    }

    return type || "Source";
  };

  return (
    <div className="w-full mt-3">
      <div className="text-sm text-foreground dark:text-foreground mb-2 flex items-center">
        <span className="mr-2">Sources</span>
        <span className="text-xs bg-background px-1.5 py-0.5 rounded-full">
          {context.length}
        </span>
      </div>

      <ScrollArea className="w-full">
        <div className="flex gap-2 pb-4">
          {context.map((reference, index) => (
            <Card
              key={reference.sourceId || index}
              className="bg-background p-3 flex flex-col min-w-[220px] max-w-[220px] hover:shadow-md transition-shadow hover:bg-muted transition-all duration-300 ease-in-out cursor-pointer"
              onClick={() => onReferenceClick?.(reference)}
            >
              <div className="flex items-start gap-2">
                {reference.url ? (
                  <FaviconDisplay url={reference.url} />
                ) : (
                  getTypeIcon(reference)
                )}

                <div className="flex-1 min-w-0">
                  <div
                    className="text-xs font-medium mb-1 line-clamp-1"
                    title={getReferenceTitle(reference)}
                  >
                    {getReferenceTitle(reference)}
                  </div>

                  <div className="flex items-center justify-between w-full mb-1.5">
                    {reference.type?.toLowerCase() !== "youtube video" && (
                      <div className="text-xs text-muted-fored dark:text-muted-foreground">
                        {getSourceDescriptor(reference)}
                      </div>
                    )}

                    {reference.type?.toLowerCase() === "youtube video" &&
                      reference.endTime !== undefined && (
                        <div className="text-xs text-muted-foreground dark:text-muted-foreground">
                          {formatVideoTime(reference.startTime)} -{" "}
                          {formatVideoTime(reference.endTime)}
                        </div>
                      )}
                  </div>

                  <div className="text-xs text-muted-foreground dark:text-foreground line-clamp-2">
                    {getTextPreview(reference.text)}
                  </div>

                </div>
              </div>
            </Card>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default ReferencesComponent;
