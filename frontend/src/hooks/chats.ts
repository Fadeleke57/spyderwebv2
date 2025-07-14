import { api } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { Message } from "ai";

export const useSaveChat = (chatId: string) => {
  return useMutation({
    mutationFn: async ({ messages }: { messages: Message[] }) => {
      const response = await api.post(`/chat/${chatId}/save`, {
        messages,
      });
      const data = await response.data.result;
      return data;
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteChat = () => {
  return useMutation({
    mutationFn: async (chatId: string) => {
      const response = await api.delete(`/chat/${chatId}`);
      const data = await response.data.result;
      return data;
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useFetchChats = () => {
  return useQuery({
    queryFn: async () => {
      const response = await api.get(`/chat/all`);
      const data = await response.data.result;
      return data;
    },
    queryKey: ["chats", "all"],
  });
};

export const useFetchChat = (chatId: string | null) => {
  return useQuery({
    queryFn: async () => {
      if (!chatId) return null;
      const response = await api.get(`/chat/${chatId}`);
      const data = await response.data.result;
      return data;
    },
    queryKey: ["chat", chatId],
  });
};
