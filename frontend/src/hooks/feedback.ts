import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

type FeedbackPayload = {
    rating: number;
    feedbackType: string;
    comment: string;
    reccomendation: string;
    webId?: string | null;
    userId?: string | null; 
};

export const useSendFeedback = () => {
  return useMutation({
    mutationFn: async (config: FeedbackPayload) => {
      const response = await api.post("/feedback", config);
      return response.data.result;
    },
    onSuccess: () => {},
    onError: () => {},
  });
};
