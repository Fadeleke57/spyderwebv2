"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { environment } from "@/environment/load_env";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import Charlotte from "@/components/chat/Charlotte";
import { useIsMobile } from "@/hooks/use-mobile";
import { Drawer, DrawerContent, DrawerTrigger } from "../ui/drawer";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { Textarea } from "../ui/textarea";
import { v4 as uuid } from "uuid";
import {
  ArrowUp,
  Clock,
  Ellipsis,
  Loader,
  MoveLeft,
  PlusCircle,
  SquarePen,
  X,
} from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { cn, formatText } from "@/lib/utils";
import {
  useConfigureChat,
  useDeleteChat,
  useFetchChat,
  useFetchChats,
  useSaveChat,
} from "@/hooks/chats";
import type { Message } from "ai";
import { motion } from "framer-motion";
import { formatDate } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { PreviewMessage, ThinkingMessage } from "../chat/charlotte-messages";
import SimpleTooltip from "./SimpleTooltip";
import { useScrollToBottom } from "@/hooks/general";
import { useRouter } from "next/router";
import DeleteModal from "./DeleteModal";
import { useUser } from "@/context/UserContext";
import { PricingModal } from "@/components/pricing/PricingModal";
import GroupedChats from "./GroupedChats";

export type viewType = "chat" | "history";

export type DBMessage = Message & {
  chatId: string;
  userId: string;
  createdAt: Date;
  messages: Message[];
};

export type CharlotteAIProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  view: viewType;
  setView: (view: viewType) => void;
  selectedChat: string | null;
  setSelectedChat: (chatId: string | null) => void;
  previouslySelectedChat: string | null;
  setPreviouslySelectedChat: (chatId: string | null) => void;
};

const suggestedActions = [
  {
    label: "Suggested",
    title: "What are the most interesting insights from this web so far?",
    action: "What are the most interesting insights from this web so far?",
  },
];

const nonWebActions = [
  {
    label: "Hello there, I'm Charlotte!",
    title: "Hop into any web to get started.",
  },
];

const nonUserActions = [
  {
    label: "Hello there, I'm Charlotte!",
    title: "Sign in or create an account to chat with me.",
  },
];

const SpydrAI = () => {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<viewType>("chat");
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [previouslySelectedChat, setPreviouslySelectedChat] = useState<
    string | null
  >(null);

  const { mutateAsync: configureCharlotte, isPending: isConfiguring } =
    useConfigureChat();

  const router = useRouter();
  const { webId } = router.query;
  const isMobile = useIsMobile();

  const mapViewToComponent = () => {
    switch (view) {
      case "chat":
        return (
          <CharlotteChatInterface
            selectedChat={selectedChat}
            setSelectedChat={setSelectedChat}
            previouslySelectedChat={previouslySelectedChat}
            setPreviouslySelectedChat={setPreviouslySelectedChat}
            open={open}
            setOpen={setOpen}
            view={view}
            setView={setView}
          />
        );
      case "history":
        return (
          <ChatHistoryInterface
            selectedChat={selectedChat}
            setSelectedChat={setSelectedChat}
            previouslySelectedChat={previouslySelectedChat}
            setPreviouslySelectedChat={setPreviouslySelectedChat}
            open={open}
            setOpen={setOpen}
            view={view}
            setView={setView}
          />
        );
      default:
        return (
          <CharlotteChatInterface
            selectedChat={selectedChat}
            setSelectedChat={setSelectedChat}
            previouslySelectedChat={previouslySelectedChat}
            setPreviouslySelectedChat={setPreviouslySelectedChat}
            open={open}
            setOpen={setOpen}
            view={view}
            setView={setView}
          />
        );
    }
  };

  useEffect(() => {
    if (!router.isReady || !webId) return;

    // call it once immediately
    configureCharlotte(webId as string);

    const interval = setInterval(() => {
      configureCharlotte(webId as string);
    }, 3000);

    return () => clearInterval(interval);
  }, [router.isReady, webId, configureCharlotte]);

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button
            variant={"link"}
            className={`fixed bottom-9 right-20 p-0 m-0 w-10 h-10 bg-background rounded-full ${open && "opacity-0"}`}
          >
            <Charlotte width={16} height={16} activeEyes={false} />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="h-[85dvh] max-h-[600px] bg-background/70 border-zinc-800 backdrop-blur-md rounded-t-xl">
          {mapViewToComponent()}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <div className="fixed z-50 bottom-20 lg:bottom-6 lg:right-20">
      <Popover open={open} onOpenChange={setOpen}>
        <SimpleTooltip content="Chat with Charlotte AI">
          <PopoverTrigger asChild className="bg-zinc-800">
            <Button
              variant={"link"}
              className={`p-0 m-0 w-10 h-10 bg-background rounded-full ${open && "opacity-0"}`}
            >
              <Charlotte width={16} height={16} activeEyes={!isMobile} />
            </Button>
          </PopoverTrigger>
        </SimpleTooltip>
        <PopoverContent
          className="w-[250px] lg:w-[500px] lg:h-[450px] bg-background/70 border-zinc-800 backdrop-blur-md rounded-xl p-0"
          align="end"
          side="top"
          sideOffset={-40}
          avoidCollisions={false}
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          {mapViewToComponent()}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SpydrAI;

const CharlotteChatInterface = ({
  open,
  setOpen,
  view,
  setView,
  selectedChat,
  setSelectedChat,
  previouslySelectedChat,
  setPreviouslySelectedChat,
}: CharlotteAIProps) => {
  const router = useRouter();
  const newChatIdRef = useRef(uuid());
  const newChatId = newChatIdRef.current;
  const chatId = selectedChat || newChatId;
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  const [saveTrigger, setSaveTrigger] = useState(false);
  const { mutateAsync: saveChat } = useSaveChat(chatId);
  const { webId } = router.query;
  const { user } = useUser();

  const token = localStorage.getItem("token") || "";

  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

  const {
    messages,
    handleSubmit,
    input,
    setInput,
    isLoading,
    stop,
    status,
    setMessages,
    append,
  } = useChat({
    maxSteps: 4,
    initialMessages: initialMessages,
    id: chatId,
    onFinish: (_, { usage }) => {
      const { promptTokens, completionTokens, totalTokens } = usage;
      setSaveTrigger(true);
    },
    onError: (error) => {
      setMessages((currentMessages) => {
        // Parse error message if it's a JSON string
        let errorDetail = error.message;
        try {
          if (error.message.includes('{"detail":')) {
            const parsed = JSON.parse(error.message);
            errorDetail = parsed.detail;
          }
        } catch (e) {
          errorDetail = error.message;
        }

        // Check for 402 error in either the status or the error message
        const is402Error = errorDetail.includes("Insufficient credits");

        if (is402Error) {
          setIsPricingModalOpen(true);
        }

        const errorMessage = {
          id: Date.now().toString(),
          role: "assistant" as const,
          content: is402Error
            ? "✨ Hey there! Looks like you've been having some great conversations with Charlotte! You've reached your monthly chat limit - upgrade your plan to keep the conversation going!"
            : error.message.includes("Too many requests")
              ? "🌟 Whoa, you're moving fast! Give me a quick moment to catch up and try again."
              : `⚠️ Oops! Something unexpected happened: ${errorDetail}`,
          error: true,
        };

        return [...currentMessages, errorMessage];
      });

      stop();
    },
    api: environment.api_url + "/chat",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const {
    data: messageData,
    isLoading: initialMessagesLoading,
    refetch: refetchInitialMessages,
  } = useFetchChat(selectedChat);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);

    // auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 300)}px`;
    }
  };

  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>(
      [messages.length],
      isLoading // the streaming state
    );

  const submitForm = () => {
    if (input.trim()) {
      handleSubmit(new Event("submit"));
    }
  };

  const handleNavigateToHistory = () => {
    if (selectedChat) {
      setPreviouslySelectedChat(selectedChat);
    }
    setSelectedChat(null);
    setView("history");
  };

  const handleNewChat = () => {
    setPreviouslySelectedChat(null);
    setSelectedChat(null);
    setInitialMessages([]);
    setMessages([]);
    newChatIdRef.current = uuid();
    setView("chat");
  };

  useEffect(() => {
    if (saveTrigger) {
      saveChat({ messages });
      setSaveTrigger(false);
    }
  }, [messages, saveChat, saveTrigger]);

  useEffect(() => {
    if (messageData) {
      setInitialMessages(messageData);
      setMessages(messageData);
    }
  }, [
    messageData,
    initialMessages,
    setInitialMessages,
    setSelectedChat,
    selectedChat,
    view,
    setView,
    setMessages,
  ]);

  return (
    <div className="flex flex-col h-full w-full rounded-lg p-0">
      {/* header */}
      <div className="flex justify-between space-x-2 py-2 px-4 items-center">
        <div>
          <small>{selectedChat ? "Chat" : "New Chat"}</small>
        </div>
        <div className="flex space-x-2 items-center">
          {selectedChat ? (
            <SimpleTooltip content="New Chat">
              <Button
                variant={"link"}
                className="rounded-full p-1 h-fit w-fit hover:bg-muted m-0"
                onClick={handleNewChat}
              >
                <SquarePen size={16} />
              </Button>
            </SimpleTooltip>
          ) : (
            <SimpleTooltip content="Chat History">
              <Button
                variant={"link"}
                className="rounded-full p-1 h-fit w-fit hover:bg-muted m-0"
                onClick={handleNavigateToHistory}
              >
                <Clock size={16} />
              </Button>
            </SimpleTooltip>
          )}
          <DropdownMenu>
            <SimpleTooltip content="Manage chats, find help, etc.">
              <DropdownMenuTrigger>
                <Button
                  variant={"link"}
                  className="rounded-full p-1 h-fit w-fit hover:bg-muted m-0"
                >
                  <Ellipsis size={16} />
                </Button>
              </DropdownMenuTrigger>
            </SimpleTooltip>
            <DropdownMenuContent>
              <DropdownMenuLabel>Chat Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => {
                    handleNavigateToHistory();
                  }}
                >
                  History
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleNewChat}
                  className="cursor-pointer"
                >
                  New Chat
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <SimpleTooltip content="Close">
            <Button
              onClick={() => setOpen(false)}
              className="rounded-full p-1 h-fit w-fit hover:bg-muted m-0"
            >
              <X size={16} />
            </Button>
          </SimpleTooltip>
        </div>
      </div>

      <ScrollArea
        className="flex-grow flex justify-center p-2 pt-0"
        ref={messagesContainerRef}
      >
        {messages.length === 0 && !selectedChat && (
          <div className="flex flex-col items-center h-full space-y-2">
            <motion.div
              className="flex w-full justify-start h-full text-muted-foreground"
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <Charlotte width={16} height={16} activeEyes={false} />
            </motion.div>
            {!user
              ? nonUserActions.map((action, index) => (
                  <motion.div
                    className="w-full p-2 hover:bg-muted hover:text-blue-300 cursor-pointer rounded-md text-muted-foreground flex flex-col transition-colors duration-200 ease-in-out"
                    initial={{ y: 5, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    key={index}
                  >
                    <small className="mb-1">{action.label}</small>
                    <p className="text-sm font-semibold">{action.title}</p>
                  </motion.div>
                ))
              : webId
                ? suggestedActions.map((action, index) => (
                    <motion.div
                      className="w-full p-2 hover:bg-muted hover:text-blue-300 cursor-pointer rounded-md text-muted-foreground flex flex-col transition-colors duration-200 ease-in-out"
                      initial={{ y: 5, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      onClick={async () => {
                        append({
                          role: "user",
                          content: action.action,
                        });
                      }}
                      key={index}
                    >
                      <small className="mb-1">{action.label}</small>
                      <p className="text-sm font-semibold">{action.title}</p>
                    </motion.div>
                  ))
                : nonWebActions.map((action, index) => (
                    <motion.div
                      className="w-full p-2 hover:bg-muted hover:text-blue-300 cursor-pointer rounded-md text-muted-foreground flex flex-col transition-colors duration-200 ease-in-out"
                      initial={{ y: 5, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      key={index}
                    >
                      <small className="mb-1">{action.label}</small>
                      <p className="text-sm font-semibold">{action.title}</p>
                    </motion.div>
                  ))}
          </div>
        )}
        {messages.length > 0 && messages[0].createdAt && (
          <div className="w-full flex justify-center mb-4">
            <small className="text-muted-foreground w-full text-center">
              {formatDate(messages[0].createdAt, "MMMM d, yyyy hh:mm aa")}
            </small>
          </div>
        )}
        <div className="flex w-full flex-col space-y-2">
          {messages.map((message, index) => (
            <PreviewMessage
              key={message.id}
              chatId={chatId as string}
              message={message}
              isLoading={isLoading && messages.length - 1 === index}
            />
          ))}
        </div>

        {isLoading &&
          messages.length > 0 &&
          messages[messages.length - 1].role === "user" && <ThinkingMessage />}
        <div
          ref={messagesEndRef}
          className="shrink-0 min-w-[24px] min-h-[10px]"
        />
        <ScrollBar />
      </ScrollArea>

      {/* input Area */}
      {webId && user && (
        <div className="p-2 shadow w-full rounded-b-lg">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              placeholder="Ask anything or talk to this web.."
              value={input}
              onChange={handleInput}
              className="w-full min-h-[40px] max-h-[300px] p-3 pr-12 rounded-lg bg-muted resize-none focus:ring-violet-400 overflow-hidden transition-all ease-in-out duration-100"
              rows={1}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  submitForm();
                }
              }}
            />
            <Button
              variant={"secondary"}
              className={cn(
                "absolute right-2 bottom-2 border h-fit rounded-full p-1 ",
                input.trim() === "" ? "opacity-50 cursor-not-allowed" : ""
              )}
              onClick={submitForm}
              disabled={input.trim() === "" || isLoading}
            >
              {isLoading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUp size={16} />
              )}
            </Button>
            {/*
              <Button
              variant={"link"}
              className={cn(
                "absolute right-10 bottom-2 border h-fit rounded-full p-1 hover:bg-muted"
              )}
              onClick={submitForm}
              disabled={isLoading}
            >
              {<Waypoints size={16} />}
            </Button>
            */}
          </div>
        </div>
      )}

      <PricingModal open={isPricingModalOpen} setOpen={setIsPricingModalOpen} />
    </div>
  );
};

const ChatHistoryInterface = ({
  open,
  setOpen,
  view,
  setView,
  selectedChat,
  setSelectedChat,
  previouslySelectedChat,
  setPreviouslySelectedChat,
}: CharlotteAIProps) => {
  const {
    data: allChats,
    isLoading: allChatsLoading,
    refetch: refetchAllChats,
  } = useFetchChats();

  const {
    mutateAsync: deleteChat,
    isPending: deletePending,
    error: deleteError,
  } = useDeleteChat();

  const [deleteVisible, setDeleteVisible] = useState(-1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteChatId, setDeleteChatId] = useState("");

  const handleNewChat = () => {
    setSelectedChat(null);
    setView("chat");
  };

  const handleSelectChat = (chatId: string) => {
    setSelectedChat(chatId);
    setPreviouslySelectedChat(chatId);
    setView("chat");
  };

  const handleGoBack = () => {
    if (previouslySelectedChat) {
      setSelectedChat(previouslySelectedChat);
      setPreviouslySelectedChat(null);
      setView("chat");
    } else {
      setSelectedChat(null);
      setView("chat");
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      await deleteChat(chatId);
      refetchAllChats();
      setDeleteModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // delay between each child animation
        delayChildren: 0.2, // delay before starting the first child animation
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
      },
    },
  };

  return (
    <div className="flex flex-col h-full w-full rounded-lg p-0">
      {/* header */}
      <div className="flex justify-between space-x-2 py-2 px-4 items-center">
        <div>
          <Button
            className="rounded-full px-3 py-1 h-fit w-fit hover:bg-muted m-0"
            onClick={handleGoBack}
          >
            <MoveLeft size={16} className="mr-2" />
            <small>Back</small>
          </Button>
        </div>
        <div className="w-full flex items-center justify-center">
          {allChatsLoading ? (
            <>
              <Loader size={16} className="animate-spin mr-2" />
              <small>Loading Chats..</small>
            </>
          ) : (
            <small>All Chats</small>
          )}
        </div>
        <div className="flex space-x-2 items-center">
          <SimpleTooltip content="New Chat">
            <Button
              className="rounded-full py-1 px-3 h-fit w-fit hover:bg-muted m-0"
              onClick={handleNewChat}
            >
              <PlusCircle size={16} className="mr-2" />
              <small>New Chat</small>
            </Button>
          </SimpleTooltip>
          <SimpleTooltip content="Close">
            <Button
              onClick={() => setOpen(false)}
              className="rounded-full p-1 h-fit w-fit hover:bg-muted m-0"
            >
              <X size={16} />
            </Button>
          </SimpleTooltip>
        </div>
      </div>

      <GroupedChats
        allChats={allChats}
        handleSelectChat={handleSelectChat}
        setDeleteChatId={setDeleteChatId}
        setDeleteModalOpen={setDeleteModalOpen}
      />

      {deleteModalOpen && (
        <DeleteModal
          open={deleteModalOpen}
          setOpen={setDeleteModalOpen}
          onDelete={() => handleDeleteChat(deleteChatId!)}
          isPending={deletePending}
          itemType="chat"
        />
      )}
    </div>
  );
};
