import { useRouter } from "next/router";
import { useChat } from "@ai-sdk/react";
import { PreviewMessage, ThinkingMessage } from "@/components/chat/message";
import { ChatInput } from "@/components/chat/chat-input";
import { useScrollToBottom } from "@/hooks/general";
import { toast } from "@/components/ui/use-toast";
import withAuth from "@/hoc/withAuth";
import Head from "next/head";
import { useFetchChat, useSaveChat } from "@/hooks/chats";
import { useEffect, useState } from "react";
import { Message } from "ai";

function Index() {
  const router = useRouter();
  const { chatId } = router.query;
  const { mutateAsync: saveChat } = useSaveChat(chatId as string);

  const {
    data: messageData,
    isPending: messagesLoading,
    refetch: refetchMessages,
    isError: messagesError,
  } = useFetchChat(chatId as string);
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  const [saveTrigger, setSaveTrigger] = useState(false);

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
    id: chatId as string,
    maxSteps: 4,
    initialMessages,
    onError: (error) => {
      if (error.message.includes("Too many requests")) {
        toast({
          title: "Too many requests",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
    },
    onFinish: async () => {
      setSaveTrigger(true);
    },
  });

  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  useEffect(() => {
    if (messageData) {
      setInitialMessages(messageData);
      setMessages(messageData);
    }
  }, [messageData]);

  useEffect(() => {
    if (saveTrigger) {
      saveChat({ messages });
      setSaveTrigger(false);
    }
  }, [saveTrigger]);

  useEffect(() => {
    setTimeout(() => {
      saveChat({ messages });
    }, 10000);
  }, []);

  return (
    <div className="flex flex-col min-w-0 h-full bg-background">
      <Head>
        <title>{messages[0]?.content || "charlotte ai - spydr"}</title>
        <meta name="description" content={"Welcome to spydr"} />
        <meta property="og:title" content={"Chat - spydr"} />
        <meta property="og:description" content={"Chat with Charlotte AI"} />
        <meta
          property="og:url"
          content={`${
            typeof window !== "undefined" ? window.location.href : ""
          }`}
        />
      </Head>
      <div
        ref={messagesContainerRef}
        className={`flex flex-col min-w-0 gap-6 flex-1 pt-4 pb-16`}
      >
        {messages.map((message, index) => (
          <PreviewMessage
            key={message.id}
            chatId={chatId as string}
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
        <ChatInput
          chatId={chatId as string}
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          stop={stop}
          setMessages={setMessages}
        />
      </form>
    </div>
  );
}

export default withAuth(Index);
