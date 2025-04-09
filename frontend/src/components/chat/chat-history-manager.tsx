// components/chat/history-manager.tsx
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Message } from "ai";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusIcon, TrashIcon } from "@/components/chat/icons";

type ChatHistory = {
  id: string;
  title: string;
  lastUpdated: number;
};

export function ChatHistoryManager() {
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const router = useRouter();
  const { chatId } = router.query;

  // Load chat history from localStorage
  useEffect(() => {
    const loadChatHistory = () => {
      const history: ChatHistory[] = [];

      // Find all chat-related localStorage items
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("chat-messages-")) {
          const id = key.replace("chat-messages-", "");
          const messages: Message[] = JSON.parse(
            localStorage.getItem(key) || "[]"
          );

          // Use first user message as title, fallback to "New Chat"
          const firstUserMessage = messages.find((m) => m.role === "user");
          const title = firstUserMessage
            ? firstUserMessage.content.toString().slice(0, 30) +
              (firstUserMessage.content.toString().length > 30 ? "..." : "")
            : "New Chat";

          history.push({
            id,
            title,
            lastUpdated: Date.now(), // Ideally this would be stored with the chat
          });
        }
      }

      // Sort by most recent
      history.sort((a, b) => b.lastUpdated - a.lastUpdated);
      setChatHistory(history);
    };

    loadChatHistory();

    // Refresh history when localStorage changes
    window.addEventListener("storage", loadChatHistory);
    return () => window.removeEventListener("storage", loadChatHistory);
  }, []);

  // Also refresh when chatId changes
  useEffect(() => {
    const loadChatHistory = () => {
      const history: ChatHistory[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("chat-messages-")) {
          const id = key.replace("chat-messages-", "");
          const messages: Message[] = JSON.parse(
            localStorage.getItem(key) || "[]"
          );

          const firstUserMessage = messages.find((m) => m.role === "user");
          const title = firstUserMessage
            ? firstUserMessage.content.toString().slice(0, 30) +
              (firstUserMessage.content.toString().length > 30 ? "..." : "")
            : "New Chat";

          history.push({
            id,
            title,
            lastUpdated: Date.now(),
          });
        }
      }

      history.sort((a, b) => b.lastUpdated - a.lastUpdated);
      setChatHistory(history);
    };

    loadChatHistory();
  }, [chatId]);

  const handleNewChat = () => {
    router.push("/chat");
  };

  const handleDeleteChat = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    localStorage.removeItem(`chat-messages-${id}`);
    setChatHistory((prev) => prev.filter((chat) => chat.id !== id));

    if (chatId === id) {
      router.push("/chat");
    }
  };

  return (
    <div className="flex flex-col h-full border-r">
      <div className="p-4">
        <Button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2"
        >
          <PlusIcon size={16} />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {chatHistory.map((chat) => (
            <Link key={chat.id} href={`/chat/${chat.id}`} passHref>
              <div
                className={`p-2 rounded-md cursor-pointer flex justify-between items-center ${
                  chatId === chat.id ? "bg-muted" : "hover:bg-muted/50"
                }`}
              >
                <span className="truncate">{chat.title}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleDeleteChat(chat.id, e)}
                  className="opacity-0 group-hover:opacity-100 hover:bg-destructive/10"
                >
                  <TrashIcon size={14} />
                </Button>
              </div>
            </Link>
          ))}

          {chatHistory.length === 0 && (
            <div className="text-muted-foreground text-center py-4">
              No chat history yet
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
