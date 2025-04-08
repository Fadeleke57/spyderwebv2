import React from "react";
import { Card } from "@/components/ui/card";
import FaviconDisplay from "@/components/utility/FaviconDisplay";
import { FileText, Youtube, FileType, Clock, Calendar } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";

// Type definitions to match your data structure
interface ChunkMetadata {
  chunkCount?: number;
  chunkIndex?: number;
  end_time?: number;
  sourceId?: string;
  start_time?: number;
  text?: string;
  timestamp?: string;
  type?: string;
  url?: string;
  id?: string;
}

interface ReferencesComponentProps {
  context?: ChunkMetadata[];
  maxHeight?: string;
  onReferenceClick?: (reference: ChunkMetadata) => void;
}

const ReferencesComponent: React.FC<ReferencesComponentProps> = ({
  context = [],
  maxHeight = "200px",
  onReferenceClick,
}) => {
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
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Get icon based on reference type
  const getTypeIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case "youtube":
        return (
          <div className="w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <Youtube className="w-4 h-4 text-red-500" />
          </div>
        );
      case "pdf":
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
      default:
        return null;
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

  // Get a time indicator for the reference
  const getTimeIndicator = (reference: ChunkMetadata) => {
    if (
      reference.start_time !== undefined &&
      reference.end_time !== undefined
    ) {
      return (
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <Clock className="w-3 h-3" />
          <span>
            {formatVideoTime(reference.start_time)} -{" "}
            {formatVideoTime(reference.end_time)}
          </span>
        </div>
      );
    }

    if (reference.timestamp) {
      return (
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <Calendar className="w-3 h-3" />
          <span>{formatDate(reference.timestamp)}</span>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="w-full">
      <Card className="bg-background p-2">
        <div className="text-sm font-medium mb-2 px-2">References</div>
        <ScrollArea className={`h-[${maxHeight}]`}>
          {context.map((reference) => (
            <div
              key={reference.id || reference.sourceId}
              className="rounded-md p-2 hover:bg-muted cursor-pointer transition-colors"
              onClick={() => onReferenceClick?.(reference)}
            >
              <div className="flex items-start gap-2">
                {reference.url ? (
                  <FaviconDisplay url={reference.url} />
                ) : (
                  getTypeIcon(reference.type)
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between w-full">
                    <div className="text-xs font-medium max-w-[50px]">
                      {reference.url
                        ? <Link href={reference.url} className="hover:underline hover:text-violet-400" target="_blank">{getDomain(reference.url)}</Link>
                        : reference.type?.toLocaleLowerCase()}
                    </div>
                    <div>{getTimeIndicator(reference)}</div>
                  </div>

                  <div className="text-xs mt-1 line-clamp-2 text-gray-700 dark:text-gray-300">
                    {getTextPreview(reference.text)}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {context.length === 0 && (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
              No references available
            </div>
          )}
        </ScrollArea>
      </Card>
    </div>
  );
};

export default ReferencesComponent;
