import React, { useState } from "react";
import { motion } from "framer-motion";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  format,
  isToday,
  isYesterday,
  isThisWeek,
  isThisMonth,
  subDays,
} from "date-fns";
import { DBMessage } from "./Assistant";

const GroupedChats: React.FC<{
  allChats: DBMessage[] | null | undefined;
  handleSelectChat: (chatId: string) => void;
  setDeleteChatId: (id: string) => void;
  setDeleteModalOpen: (open: boolean) => void;
}> = ({ allChats, handleSelectChat, setDeleteChatId, setDeleteModalOpen }) => {
  const [deleteVisible, setDeleteVisible] = useState<string | number>(-1);

  // Format text to show a preview
  const formatText = (text: string | undefined, maxLength: number): string => {
    if (!text) return "New conversation";
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  // Format date
  const formatDate = (date: string | Date, formatString: string): string => {
    return format(new Date(date), formatString);
  };

  // Group chats by timeframe
  const groupChats = (): {
    today: DBMessage[];
    yesterday: DBMessage[];
    pastWeek: DBMessage[];
    pastMonth: DBMessage[];
    older: DBMessage[];
  } => {
    const today: DBMessage[] = [];
    const yesterday: DBMessage[] = [];
    const pastWeek: DBMessage[] = [];
    const pastMonth: DBMessage[] = [];
    const older: DBMessage[] = [];

    // Process each chat
    allChats?.forEach((chat) => {
      const chatDate = new Date(chat.createdAt);

      if (isToday(chatDate)) {
        today.push(chat);
      } else if (isYesterday(chatDate)) {
        yesterday.push(chat);
      } else if (isThisWeek(chatDate, { weekStartsOn: 1 })) {
        // weekStartsOn: 1 means week starts on Monday
        pastWeek.push(chat);
      } else if (isThisMonth(chatDate)) {
        pastMonth.push(chat);
      } else {
        older.push(chat);
      }
    });

    return { today, yesterday, pastWeek, pastMonth, older };
  };

  const { today, yesterday, pastWeek, pastMonth, older } = groupChats();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  // Render a section with header if it has chats
  const renderSection = (
    title: string,
    chats: DBMessage[]
  ): React.ReactNode => {
    if (!chats || chats.length === 0) return null;

    return (
      <div className="mb-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">
          {title}
        </h3>
        <div className="space-y-2">
          {chats.map((chat, index) => (
            <motion.div
              key={`${title}-${index}`}
              variants={itemVariants}
              className="relative border w-full p-2 bg-muted/80 hover:bg-muted cursor-pointer rounded-md text-muted-foreground flex flex-col transition-all duration-200 ease-in-out"
              onClick={() => handleSelectChat(chat.chatId)}
              onMouseEnter={() => setDeleteVisible(`${title}-${index}`)}
              onMouseLeave={() => setDeleteVisible(-1)}
            >
              <span className="text-sm font-semibold text-foreground">
                {formatText(chat.messages[0].content, 50)}
              </span>
              <span className="text-xs">
                {formatDate(chat.createdAt, "MMM dd, yyyy hh:mm a")}
              </span>
              <Button
                variant="link"
                className={`absolute top-4 right-4 h-fit w-fit p-1 ${deleteVisible === `${title}-${index}` ? "opacity-100" : "opacity-0"} transition-all duration-200 ease-in-out hover:text-red-400`}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setDeleteChatId(chat.chatId);
                  setDeleteModalOpen(true);
                }}
              >
                <Trash2 size={16} />
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <ScrollArea className="flex-grow flex justify-center p-2 pt-0 space-y-2 px-3">
      <motion.div
        className="w-full space-y-2"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {renderSection("Today", today)}
        {renderSection("Yesterday", yesterday)}
        {renderSection("Past Week", pastWeek)}
        {renderSection("Past Month", pastMonth)}
        {renderSection("Older", older)}

        {allChats?.length === 0 && (
          <div className="text-center text-muted-foreground py-4">
            No conversations yet
          </div>
        )}
      </motion.div>
      <ScrollBar />
    </ScrollArea>
  );
};

export default GroupedChats;
