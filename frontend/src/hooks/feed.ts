import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

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
