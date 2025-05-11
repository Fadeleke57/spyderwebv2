import { useFetchLinkPreviewData } from "@/hooks/sources";
import { useSourceStore } from "@/store/sourceStore";
import React, { useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";
import Image from "next/image";
import Link from "next/link";
import { formatFileSize } from "../webs/SourceToolTip";
import { formatText } from "@/lib/utils";

type linkPreview = {
  ogImage: string;
  ogTitle: string;
  ogDescription: string;
  favicon: string;
};

function LinkPreview({ url, disabled }: { url: string; disabled: boolean }) {
  const { selectedSourceId, source } = useSourceStore();
  const [linkPreview, setLinkPreview] = useState<linkPreview | null>(null);
  const [currentDate, setCurrentDate] = useState("");
  console.log("dsisabled", disabled);
  useEffect(() => {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    setCurrentDate(`${day}/${month}/${year}`);
  }, []);

  const {
    data: linkPreviewData,
    isLoading: isLinkPreviewDataLoading,
    error: linkPreviewDataError,
  } = useFetchLinkPreviewData(url, selectedSourceId, disabled);

  useEffect(() => {
    if (linkPreviewData) {
      setLinkPreview(linkPreviewData);
    }
  }, [linkPreviewData]);

  if (isLinkPreviewDataLoading || (!linkPreview && !disabled)) {
    return <Skeleton className="h-[77dvh] w-full rounded-lg" />;
  }

  const imageUrl = disabled
    ? source?.ogImage || ""
    : linkPreview?.ogImage || "";
  const title = disabled ? source?.ogTitle || "" : linkPreview?.ogTitle || "";
  const description = disabled
    ? source?.ogDescription || ""
    : linkPreview?.ogDescription || "";
  const domain = url ? new URL(url).hostname.replace("www.", "") : "";
  const favicon = disabled ? source?.favicon || "" : linkPreview?.favicon || "";

  return (
    <Link
      href={url}
      target="_blank"
      className="block transition-shadow duration-200 hover:shadow-[0_4px_6px_-1px_rgba(59,130,246,0.5), 0_2px_4px_-1px_rgba(59,130,246,0.3)]"
    >
      <div className="w-full h-full min-h-[77dvh] border rounded-lg overflow-hidden bg-black/40 text-foreground">
        <div className="p-3 rounded-lg m-2">
          <div className="relative">
            <div className="w-full aspect-video rounded-lg overflow-hidden bg-background">
              {imageUrl ? (
                <Image
                  width={300}
                  height={300}
                  src={imageUrl}
                  alt="Link Preview"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="w-full min-h-[300px] flex items-center justify-center">
                  <div className="flex items-center">
                    <div className="w-5 h-5 bg-foreground rounded-sm mr-2"></div>
                    <span className="text-gray-300">No Preview Image</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-center mb-2">
              {favicon ? (
                <Image
                  src={favicon}
                  width={24}
                  height={24}
                  alt="Site icon"
                  className="w-6 h-6 mr-2"
                />
              ) : null}
              <span className="text-foreground uppercase text-sm font-semibold tracking-wider">
                {domain}
              </span>
            </div>

            <h2 className="text-xl font-semibold mb-2">
              {formatText(title || source?.name || "Untitled", 50)}
            </h2>

            <p className="text-muted-foreground mb-3">
              {formatText(description, 130)}
            </p>

            <div className="flex items-center gap-2 text-foreground text-sm">
              <span className="font-bold">
                {formatFileSize(source ? source.size : 0)}
              </span>
              <span>*</span> <span>{currentDate}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default LinkPreview;
