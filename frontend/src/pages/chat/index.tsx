import { useRouter } from "next/router";
import { useChat } from "@ai-sdk/react";
import { useEffect, useRef } from "react";
import { v4 as uuid } from "uuid";
import { DummyMultimodalInput } from "@/components/chat/dummy-multimodal-input";
import { Overview } from "@/components/chat/overview";
import { useScrollToBottom } from "@/hooks/general";
import { toast } from "@/components/ui/use-toast";
import withAuth from "@/hoc/withAuth";
import Head from "next/head";
import { environment } from "@/environment/load_env";

function Index() {
  const router = useRouter();
  const chatIdRef = useRef(uuid());
  const chatId = chatIdRef.current;

  const {
    id,
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    isLoading,
    stop,
  } = useChat({
    api: `${environment.api_url}/chat`,
    id: chatId,
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

  //redirect to chat route when first message is submitted
  useEffect(() => {
    if (messages.length > 0 && messages[0].role === "user") {
      router.push(`/chat/${id}`);
    }
  }, [messages, id, router]);

  const handleChatSubmit = async (e: any, options?: any) => {
    e?.preventDefault?.();
    handleSubmit(e, options);
  };

  return (
    <div className="flex flex-col min-w-0 h-full bg-background">
      <Head>
        <title>charlotte ai - spydr</title>
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
      {messages.length === 0 && (
        <div
          ref={messagesContainerRef}
          className={`flex flex-col min-w-0 gap-6 flex-1 pt-4 ${messages.length === 0 ? "" : "pb-16"}`}
        >
          <Overview />

          <div
            ref={messagesEndRef}
            className="shrink-0 min-w-[24px] min-h-[24px]"
          />
        </div>
      )}
      {messages.length === 0 && (
        <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
          <DummyMultimodalInput
            chatId={chatId}
            input={input}
            setInput={setInput}
            handleSubmit={handleChatSubmit}
            isLoading={isLoading}
            stop={stop}
            messages={messages}
            setMessages={setMessages}
            append={append}
          />
        </form>
      )}
    </div>
  );
}

export default withAuth(Index);
