import { api } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useFetchUserFeeds = (userId: string | null) => {
  return useQuery({
    queryFn: async () => {
      const response = await api.get(`/feeds/all/${userId}`);
      const data = await response.data.result;
      return data;
    },
    queryKey: ["feeds", "all", userId],
    enabled: !!userId,
  });
};

export const useRevokeFeedAccess = () => {
  return useMutation({
    mutationFn: async ({
      clientId,
      userId,
    }: {
      clientId: string;
      userId: string;
    }) => {
      const response = await api.patch(
        `/feeds/revoke/client/${clientId}/user/${userId}`
      );
      const data = await response.data.result;
      return data;
    },
    mutationKey: ["feeds", "revoke"],
    onError: (err: any) => {
      console.error(err);
    },
  });
};
