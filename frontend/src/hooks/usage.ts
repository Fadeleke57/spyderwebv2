import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export function useResourceUsage(userId?: string) {
  return useQuery({
    queryKey: ["resourceUsage"],
    queryFn: async () => {
      const response = await api.get("/users/usage");
      return response.data;
    },
    enabled: !!userId,
  });
}

type checkoutPayload = {
  tier: string;
  is_yearly: boolean;
};

export function useCreateCheckoutSession() {
  return useMutation({
    mutationFn: async (payload: checkoutPayload) => {
      const response = await api.post(
        "/payment/create-checkout-session",
        payload
      );
      return response.data;
    },
    onError: (err: any) => {
      console.error(err);
    },
    onSuccess: (data) => {
      window.location.href = data.url;
    },
  });
}
