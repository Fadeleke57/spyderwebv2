import React, { useState } from "react";
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
import {
  Paperclip,
  CornerDownLeft,
  ImageIcon,
} from "lucide-react";
import { Bucket } from "@/types/bucket";
import { PublicUser } from "@/types/user";
import BucketSearchModal from "./BucketSearchModal";
import BucketGraph from "./BucketGraph";
import {
  BucketConfigFormValues,
} from "@/types/article";
import { Source } from "@/types/source";

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
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [fetchedSources, setFetchedSources] = useState<Source[]>([]);

  return (
    <div className="relative flex h-full min-h-[50vh] flex-col rounded-xl bg-muted/50 lg:col-span-2">
      <Badge variant="outline" className="absolute right-3 top-3">
        {bucket?.sourceIds?.length || 0} sources added
      </Badge>
      {isOwner &&
      (bucket?.sourceIds?.length === undefined ||
        bucket?.sourceIds?.length === null || bucket?.sourceIds?.length > 0) ? (
        <div className="absolute right-3 top-6">
          <BucketSearchModal
            config={config}
            setConfig={setConfig}
            bucket={bucket}
            refetch={refetch}
          />
        </div>
      ) : null}

      {isOwner && bucket?.sourceIds?.length === 0 && (
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/4 flex flex-col items-center gap-1 text-center">
          <h3 className="text-2xl font-bold tracking-tight">
            Add your first source
          </h3>
          <p className="text-sm text-muted-foreground">
            Start collecting data to add your mind map here.
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
        bucketId={bucket?.bucketId}
        hasSources={bucket?.sourceIds?.length ? true : false}
        fetchedSources={fetchedSources}
        setFetchedSources={setFetchedSources}
        selectedSourceId={selectedSourceId}
        setSelectedSourceId={setSelectedSourceId}
      />
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 right-0 w-[90%]">
        <form className="relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring">
          <Label htmlFor="comments" className="sr-only">
            Comment
          </Label>
          <Textarea
            id="comments"
            placeholder="What would you like to learn..."
            className=" resize-none border-0 p-4 shadow-none focus-visible:ring-0"
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
              Ask
              <CornerDownLeft className="size-3.5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BucketPlayground;
