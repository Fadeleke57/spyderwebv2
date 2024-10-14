import React from "react";
import { useRouter } from "next/router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "../ui/tooltip";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Paperclip, Mic, CornerDownLeft } from "lucide-react";
import { Bucket } from "@/types/bucket";
import { User } from "next-auth";

function BucketPlayground({ bucket, user }: { bucket: Bucket, user: User | null }) {
  const router = useRouter();
  const isOwner = user && user?.id === bucket?.userId;

  return (
    <div className="relative flex h-full min-h-[50vh] flex-col rounded-xl bg-muted/50 p-4 lg:col-span-2">
      <Badge variant="outline" className="absolute right-3 top-3">
        Bucket
      </Badge>
      {bucket?.articleIds.length === 0 && (
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/4 flex flex-col items-center gap-1 text-center">
          <h3 className="text-2xl font-bold tracking-tight">
            {user ? "Iterate" : "Sign in to iterate on this bucket"}
          </h3>
          {user && (
            <p className="text-sm text-muted-foreground">
              Start collecting data to add your bucket here.
            </p>
          )}
          <Button
            className="mt-4"
            onClick={() => router.push(`${user ? "/terminal" : "/auth/login"}`)}
          >
            {user ? "Open Terminal" : "Login"}
          </Button>
        </div>
      )}
      <div className="flex-1" />
      <form
        className="relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring"
        x-chunk="dashboard-03-chunk-1"
      >
        <Label htmlFor="notes" className="sr-only">
          Notes
        </Label>
        <Textarea
          id="notes"
          placeholder={`${isOwner ? "Add a note..." : "Add a comment to this bucket..."}`}
          className="min-h-12 resize-none border-0 p-3 shadow-none focus-visible:ring-0"
        />
        <div className="flex items-center p-3 pt-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Paperclip className="size-4" />
                  <span className="sr-only">Attach file</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Attach File</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Mic className="size-4" />
                  <span className="sr-only">Use Microphone</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Use Microphone</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button type="submit" size="sm" className="ml-auto gap-1.5">
            Add Note
            <CornerDownLeft className="size-3.5" />
          </Button>
        </div>
      </form>
    </div>
  );
}

export default BucketPlayground;