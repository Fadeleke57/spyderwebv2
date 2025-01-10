import React from "react";
import ReactMarkdown from "react-markdown";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "date-fns";
import { Source, SourceAsNode } from "@/types/source";

interface NoteComponentProps {
  content?: string;
  isOwner?: boolean;
  source: SourceAsNode | null;
  handleNoteContentChange: any;
  updateError: any;
}
const NoteComponent = ({
  content,
  isOwner,
  source,
  handleNoteContentChange,
  updateError,
}: NoteComponentProps) => {
  const [editing, setEditing] = React.useState(false);

  return (
    <ScrollArea className="h-[calc(97vh-210px)]">
      <small className="text-muted-foreground">
        {formatDate(
          new Date(source ? source.updated + "Z" : ""),
          "MMMM dd, yyyy hh:mm a"
        )}
      </small>

      {isOwner ? (
        editing || !content ? (
          <Textarea
            value={content}
            placeholder="Content... (Supports Markdown)"
            rows={1}
            className="mt-4 w-full min-h-[1px] bg-transparent p-0 text-lg leading-relaxed resize-none focus:outline-none border-none bg-none p-0 ring-offset-none focus-visible:ring-0 focus-visible:ring-offset-0 text-lg font-normal resize-none text-sm text-foreground"
            onInput={(e: any) => {
              e.target.style.height = "auto";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            onChange={handleNoteContentChange}
          />
        ) : (
          <div
            className="prose dark:prose-invert max-w-none mt-4"
            onClick={() => setEditing(true)}
          >
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )
      ) : (
        <div
          className="prose dark:prose-invert max-w-none mt-4"
          onClick={() => setEditing(true)}
        >
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      )}

      {updateError && <p className="text-red-500">{updateError}</p>}
    </ScrollArea>
  );
};

export default NoteComponent;
