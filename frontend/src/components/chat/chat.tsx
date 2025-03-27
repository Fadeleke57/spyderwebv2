"use client";

import { PreviewMessage, ThinkingMessage } from "@/components/chat/message";
import { MultimodalInput } from "@/components/chat/multimodal-input";
import { Overview } from "@/components/chat/overview";
import { useScrollToBottom } from "@/hooks/general";
import { useChat } from "ai/react";
import { toast} from "@/components/ui/use-toast";

export function Chat() {
  const chatId = "001";

  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    isLoading,
    stop,
  } = useChat({
    maxSteps: 4,
    onError: (error) => {
      if (error.message.includes("Too many requests")) {
        toast({
          title: "Too many requests",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
    },
  });

  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  return (
    <div className="flex flex-col min-w-0 h-full bg-background">
      <div
        ref={messagesContainerRef}
        className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4"
      >
        {messages.length === 0 && <Overview />}

        {messages.map((message, index) => (
          <PreviewMessage
            key={message.id}
            chatId={chatId}
            message={message}
            isLoading={isLoading && messages.length - 1 === index}
          />
        ))}

        {isLoading &&
          messages.length > 0 &&
          messages[messages.length - 1].role === "user" && <ThinkingMessage />}

        <div
          ref={messagesEndRef}
          className="shrink-0 min-w-[24px] min-h-[24px]"
        />
      </div>

      <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
        <MultimodalInput
          chatId={chatId}
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          stop={stop}
          messages={messages}
          setMessages={setMessages}
          append={append}
        />
      </form>
    </div>
  );
}
