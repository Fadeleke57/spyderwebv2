import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn, formatText, mapToolNameToBreadcrumb } from "@/lib/utils";
import {
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Save,
  NotebookText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/chat/markdown";
import Charlotte from "@/components/chat/Charlotte";
import { PreviewAttachment } from "./preview-attachment";
import { Weather } from "./genui/weather";
import { Message } from "ai";
import SimpleTooltip from "../utility/SimpleTooltip";
import ReferencesComponent, {
  formatLinkwithTimeStamp,
  ReferenceMetadata,
} from "./genui/graphcontext";
import { url } from "inspector";
import { useUploadNote } from "@/hooks/sources";
import { useRouter } from "next/router";
import { useFetchWebById } from "@/hooks/webs";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";
import FeedbackModal from "../utility/FeedbackModal";

const UserMessage = ({ message }: { message: Message }) => {
  return (
    <motion.div
      className="w-full mx-auto px-4 group/message text-sm flex justify-end"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      data-role="user"
    >
      <div
        className={cn(
          "bg-foreground text-background flex gap-4 px-3 w-fit max-w-sm ml-auto py-2 rounded-xl"
        )}
      >
        <div className="flex flex-col gap-2">
          {message.content && (
            <div className="relative flex flex-col gap-4 rounded-lg transform transition-all ease-in-out duration-100 overflow-hidden">
              <Markdown>{message.content as string}</Markdown>
            </div>
          )}

          {message.experimental_attachments && (
            <div className="flex flex-row gap-2">
              {message.experimental_attachments.map((attachment) => (
                <PreviewAttachment
                  key={attachment.url}
                  attachment={attachment}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const AssistantMessage = ({
  message,
  isLoading,
  chatId,
}: {
  chatId: string;
  message: Message;
  isLoading: boolean;
}) => {
  const router = useRouter();
  const [isCopied, setIsCopied] = useState(false);
  const [toolbarVisible, setToolbarVisible] = useState(false);
  const [review, setReview] = useState<"like" | "dislike" | null>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const { webId } = router.query;
  const { data: web } = useFetchWebById(webId as string);
  const { mutateAsync: uploadNote } = useUploadNote(webId as string);
  const { user } = useUser();

  const isOwner = user && web && user.id === web.userId;

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(message.content);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy!", error);
    }
  };

  const handleMakeNote = async (message: Message) => {
    try {
      await uploadNote({
        title: `Assistant Note: ${formatText(message.content, 50)}...`,
        content: message.content,
      });
      toast("Message saved as note!");
    } catch (error) {
      console.error("Failed to make note!", error);
    }
  };

  const handleReferenceClick = (reference: ReferenceMetadata) => {
    if (reference.url && reference.type != "pdf document") {
      const url = formatLinkwithTimeStamp(reference.url, reference.startTime);
      window.open(url, "_blank");
      return;
    }
  };

  const handleDislike = () => {
    setReview("dislike");
    setFeedbackModalOpen(true);
  };

  return (
    <motion.div
      className="w-full max-w-md p-4 group/message text-sm hover:cursor-pointer rounded-xl hover:bg-muted/50 relative"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      data-role="assistant"
      onMouseEnter={() => setToolbarVisible(true)}
      onMouseLeave={() => setToolbarVisible(false)}
    >
      {" "}
      <div
        className={`absolute -top-[40px] left-0 flex flex-row ${toolbarVisible && !isLoading ? "opacity-100" : "opacity-0"} transition-all ease-in-out duration-200`}
      >
        <div>
          <SimpleTooltip content="Copy">
            <Button
              variant={"secondary"}
              className="rounded-sm rounded-r-none h-8 w-fit py-1 px-2 flex items-center justify-center"
              onClick={handleCopy}
            >
              <Copy
                size={14}
                className={`transition-all duration-200 ${
                  isCopied
                    ? "opacity-0 hidden scale-50"
                    : "opacity-100 scale-100"
                }`}
              />
              <Check
                size={14}
                className={`transition-all duration-200 text-white-500 ${
                  isCopied
                    ? "opacity-100 scale-100"
                    : "hidden opacity-0 scale-50"
                }`}
              />
            </Button>
          </SimpleTooltip>
        </div>
        <div>
          <SimpleTooltip content="Like">
            <Button
              className="rounded-none h-8 w-fit py-1 px-2  transition-all ease-in-out duration-200"
              onClick={() => setReview("like")}
            >
              <ThumbsUp
                size={14}
                className={`${review === "like" ? "fill-foreground" : ""}`}
              />
            </Button>
          </SimpleTooltip>
        </div>
        <div>
          <SimpleTooltip content="Dislike">
            <Button
              className={`rounded-sm rounded-l-none ${isOwner ? "rounded-r-none" : ""} h-8 w-fit py-1 px-2 transition-all ease-in-out duration-200`}
              onClick={handleDislike}
            >
              <ThumbsDown
                size={14}
                className={`${review === "dislike" ? "fill-foreground" : ""}`}
              />
            </Button>
          </SimpleTooltip>
        </div>
        {isOwner && (
          <div>
            <SimpleTooltip content="Save as note">
              <Button
                className="rounded-l-none h-8 w-fit py-1 px-2  transition-all ease-in-out duration-200"
                variant={"outline"}
                onClick={() => handleMakeNote(message)}
              >
                <NotebookText size={14} className="mr-2" />{" "}
                <small>Make Note</small>
              </Button>
            </SimpleTooltip>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <AnimatePresence>
          {message.parts && message?.parts?.[0].type === "tool-invocation" && (
            <motion.span
              className="italic font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {mapToolNameToBreadcrumb(
                message.parts[0].toolInvocation.toolName
              )}
            </motion.span>
          )}
        </AnimatePresence>
        <div className="flex flex-col gap-2 w-full">
          {message.content && (
            <div className="flex flex-col gap-4 rounded-lg cursor-pointer transform transition-all ease-in-out duration-100">
              <Markdown>{message.content as string}</Markdown>
            </div>
          )}

          {message.toolInvocations && message.toolInvocations.length > 0 && (
            <div className="flex flex-col gap-4">
              {message.toolInvocations.map((toolInvocation) => {
                const { toolName, toolCallId, state } = toolInvocation;

                if (state === "result") {
                  const { result } = toolInvocation;

                  return (
                    <div key={toolCallId}>
                      {toolName === "get_current_weather" && (
                        <Weather weatherAtLocation={result} />
                      )}
                      {toolName === "get_graph_context" && (
                        <ReferencesComponent
                          context={result.context}
                          onReferenceClick={handleReferenceClick}
                        />
                      )}
                    </div>
                  );
                }
                return (
                  <div
                    key={toolCallId}
                    className={cn({
                      skeleton: ["get_current_weather"].includes(toolName),
                    })}
                  >
                    {toolName === "get_current_weather" ? <Weather /> : null}
                    {toolName === "get_graph_context" ? (
                      <ReferencesComponent />
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}

          {message.experimental_attachments && (
            <div className="flex flex-row gap-2">
              {message.experimental_attachments.map((attachment) => (
                <PreviewAttachment
                  key={attachment.url}
                  attachment={attachment}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <FeedbackModal open={feedbackModalOpen} setOpen={setFeedbackModalOpen} />
    </motion.div>
  );
};

export const PreviewMessage = ({
  message,
  isLoading,
  chatId,
}: {
  chatId: string;
  message: Message;
  isLoading: boolean;
}) => {
  return message.role === "user" ? (
    <UserMessage message={message} />
  ) : (
    <AssistantMessage message={message} isLoading={isLoading} chatId={chatId} />
  );
};

export const ThinkingMessage = () => {
  const role = "assistant";

  return (
    <motion.div
      className="w-full mx-auto my-2 max-w-3xl px-4 group/message"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role={role}
    >
      <div
        className={cn(
          "flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl",
          {
            "group-data-[role=user]/message:bg-muted": true,
          }
        )}
      >
        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
          <Charlotte width={10} height={10} activeEyes={false} />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-4 text-muted-foreground">
            Thinking...
          </div>
        </div>
      </div>
    </motion.div>
  );
};
