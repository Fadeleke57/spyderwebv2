import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { ArticleAsNode } from "@/types/article";
import Link from "next/link";
import { SquareArrowOutUpRight } from "lucide-react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { format } from "date-fns";

type NotesTabProps = {
  article: ArticleAsNode;
  color?: string;
  loading: boolean;
};

function NotesTab({ article, loading }: NotesTabProps) {
    
  return (
    <Card className="relative">
      <ScrollArea className="h-[calc(85vh-80px)]">
        {!loading && (
          <>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>{format(new Date(), "MM/dd/yyyy hh:mm a")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                id="description"
                rows={1}
                placeholder="Some ideas, thoughts, or notes..."
                className="w-full min-h-[1px] bg-transparent p-0 text-lg leading-relaxed resize-none focus:outline-none border-none bg-none p-0 ring-offset-none focus-visible:ring-0 focus-visible:ring-offset-0 text-lg font-normal resize-none text-sm text-muted-foreground"
                onInput={(e: any) => {
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                onChange={(e: any) => {}}
              />
            </CardContent>
          </>
        )}
        {loading && <p>Loading...</p>}
      </ScrollArea>
    </Card>
  );
}

export default NotesTab;
