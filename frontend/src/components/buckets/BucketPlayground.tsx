import React, { useState } from "react";
import { useRouter } from "next/router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "../ui/tooltip";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Paperclip, Mic, CornerDownLeft, Search, ImageIcon } from "lucide-react";
import { Bucket } from "@/types/bucket";
import { PublicUser } from "@/types/user";
import BucketSearchModal from "./BucketSearchModal";
import BucketGraph from "./BucketGraph";
import {
  Article,
  BucketConfigFormValues,
  ConfigFormValues,
} from "@/types/article";

function BucketPlayground({
  bucket,
  user,
  refetch,
}: {
  bucket: Bucket;
  user: PublicUser | null;
  refetch: () => void;
}) {
  const isOwner = user && user?.id === bucket?.userId;
  const [config, setConfig] = useState<BucketConfigFormValues>({
    title: bucket?.name || "",
    description: bucket?.description || "",
  });
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(
    null
  );
  const [fetchedArticles, setFetchedArticles] = useState<Article[]>([]);

  return (
    <div className="relative flex h-full min-h-[50vh] flex-col rounded-xl bg-muted/50 lg:col-span-2">
      <Badge variant="outline" className="absolute right-3 top-3">
        Bucket
      </Badge>
      {isOwner && bucket?.articleIds.length === 0 && (
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/4 flex flex-col items-center gap-1 text-center">
          <h3 className="text-2xl font-bold tracking-tight">
            Add your first article
          </h3>
          <p className="text-sm text-muted-foreground">
            Start collecting data to add your bucket here.
          </p>
          <BucketSearchModal
            config={config}
            setConfig={setConfig}
            bucket={bucket}
            refetch={refetch}
          />
        </div>
      )}
      <div className="flex-1" />
      <BucketGraph
        config={config}
        setConfig={setConfig}
        bucketId={bucket.bucketId}
        hasArticles={bucket?.articleIds.length > 0}
        fetchedArticles={fetchedArticles}
        setFetchedArticles={setFetchedArticles}
        selectedArticleId={selectedArticleId}
        setSelectedArticleId={setSelectedArticleId}
      />
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 right-0 w-[90%]">
        <form
          className="relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring"
          x-chunk="dashboard-03-chunk-1"
        >
          <Label htmlFor="notes" className="sr-only">
            Notes
          </Label>
          <Textarea
            id="notes"
            placeholder={`${
              isOwner ? "Add a note..." : "Add a comment to this bucket..."
            }`}
            className="min-h-12 resize-none border-0 p-3 shadow-none focus-visible:ring-0"
          />
          <div className="flex items-center p-3 pt-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Paperclip className="size-4" />
                    <span className="sr-only">Attach file</span>
                    <input type="file" className="hidden" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Attach File</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <ImageIcon className="size-4" />
                    <span className="sr-only">Add Image</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Add Image</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button type="submit" size="sm" className="ml-auto gap-1.5">
              {isOwner ? " Add Note" : "Comment"}
              <CornerDownLeft className="size-3.5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BucketPlayground;
