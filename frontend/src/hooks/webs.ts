import { api } from "@/lib/api";
import { UpdateWeb } from "@/types/web";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

export function useFetchUserWebs(criteria?: string) {
  return useInfiniteQuery({
    queryKey: ["user", "webs", criteria],
    queryFn: async ({ pageParam = { page: 1, direction: "forward" } }) => {
      const response = await api.get(`/webs/all/user`, {
        params: {
          page: pageParam.page,
          page_size: 10,
          criteria: criteria,
        },
      });
      return {
        ...response.data,
      };
    },
    initialPageParam: { page: 1, direction: "forward" },
    getPreviousPageParam: (lastPage, allPages) => {
      return lastPage.prevCursor;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.nextCursor) return undefined;
      return { page: lastPage.nextCursor, direction: "forward" };
    },
  });
}

export const useFetchLikedWebs = () => {
  return useQuery({
    queryKey: ["webs", "liked"],
    queryFn: async () => {
      const response = await api.get("/webs/liked/user");
      return response.data.result;
    },
  });
};

export const useCreateWeb = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (config: any) => {
      const response = await api.post("/webs/create", config);
      return response.data.result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webs", "all"] });
    },
    onError: () => {},
  });
};

export const useFetchSavedWebs = () => {
  return useQuery({
    queryKey: ["webs", "saved"],
    queryFn: async () => {
      const response = await api.get("/webs/saved/user");
      return response.data.result;
    },
  });
};

export const useUploadImageToWeb = (webId: string | undefined | null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ files }: { files: File[] }) => {
      if (!webId) return;
      const formData = new FormData();

      files.forEach((file) => {
        formData.append("files", file);
      });

      const { data } = await api.post(`/webs/upload/image/${webId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return data.imageUrls;
    },
    onError: (error: any) => {
      console.error("Image upload failed:", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["images", "web", webId] });
    },
  });
};

export const useDeleteImageFromWeb = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      webId,
      imageUrl,
    }: {
      webId: string;
      imageUrl: string;
    }) => {
      const imageName = imageUrl.split("/").pop();
      const response = await api.delete(
        `/webs/delete/image/${webId}/${imageName}`
      );
      return response.data.result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["images", "web"] });
    },
  });
};

export function useGetAllImagesForWeb(webId: string | null) {
  return useQuery({
    queryKey: ["images", "web", webId],
    queryFn: async () => {
      const response = await api.get(`/webs/images/web/${webId}`);
      return response.data.result;
    },
    enabled: !!webId,
    staleTime: Infinity,
  });
}

export function useDeleteWeb() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (webId: string) => {
      const response = await api.delete("/webs/delete", {
        params: { webId },
      });
      return response.data.result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webs", "all"] });
    },
    onError: () => {},
  });
}

export const useUpdateWeb = (webId: string | null | undefined) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (config: UpdateWeb) => {
      if (!webId) return;
      const response = await api.patch(`/webs/update/${webId}`, config, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data.result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webs", "all"] });
    },
    onError: () => {},
  });
};

export function useFetchPublicWebs() {
  return useInfiniteQuery({
    queryKey: ["webs", "public"],
    queryFn: async ({ pageParam = null }) => {
      const response = await api.get("/webs/all", {
        params: {
          cursor: pageParam,
          limit: 10,
          visibility: "Public",
        },
      });
      return response.data;
    },
    initialPageParam: null,
    getNextPageParam: (lastPage, pages) => {
      return lastPage.nextCursor;
    },
  });
}

export function useFetchProfileWebs(
  userId: string,
  visibility: string | null = null
) {
  return useInfiniteQuery({
    queryKey: ["webs", "profile", userId],
    queryFn: async ({ pageParam = null }) => {
      const response = await api.get("/webs/all", {
        params: {
          cursor: pageParam,
          limit: 10,
          userId: userId,
          visibility,
        },
      });
      return response.data;
    },
    initialPageParam: null,
    getNextPageParam: (lastPage, pages) => {
      return lastPage.nextCursor;
    },
    enabled: !!userId,
  });
}

export function useFetchPopularWebs(limit: number) {
  return useQuery({
    queryKey: ["webs", "popular", limit],
    queryFn: async () => {
      const response = await api.get("/webs/popular", {
        params: {
          limit,
        },
      });
      return response.data.result;
    },
  });
}

export const useFetchWebById = (webId: string) => {
  return useQuery({
    queryKey: ["web", webId],
    queryFn: async () => {
      if (!webId) return null;
      const response = await api.get(`/webs/id`, {
        params: { webId },
      });
      return response.data.result;
    },
  });
};

export function useLikeWeb(webId?: string | null) {
  return useMutation({
    mutationFn: async () => {
      if (!webId) return;
      const response = await api.post(`/webs/like/${webId}`);
      return response.data.result;
    },
    onSuccess: () => {},
    onError: () => {},
  });
}

export function useUnlikeWeb(webId?: string | null) {
  return useMutation({
    mutationFn: async () => {
      if (!webId) return;
      const response = await api.post(`/webs/unlike/${webId}`);
      return response.data.result;
    },
    onSuccess: () => {},
    onError: () => {},
  });
}

export function useAddTagToWeb(webId: string) {
  return useMutation({
    mutationFn: async (tag: string) => {
      const response = await api.patch(`/webs/add/tag/${webId}/${tag}`);
      return response.data.result;
    },
    onSuccess: () => {},
    onError: () => {},
  });
}

export function useRemoveTagFromWeb(webId: string) {
  return useMutation({
    mutationFn: async (tag: string) => {
      const response = await api.patch(`/webs/remove/tag/${webId}/${tag}`);
      return response.data.result;
    },
    onSuccess: () => {},
    onError: () => {},
  });
}

export type IterateWebPayload = {
  name: string;
  description: string;
  withConnections: boolean;
};

export function useIterateWeb(webId: string) {
  return useMutation({
    mutationFn: async (config: IterateWebPayload) => {
      const response = await api.post(`/webs/iterate/${webId}`, config);
      return response.data.result;
    },
    onSuccess: () => {},
    onError: () => {},
  });
}

export type SearchFilter = {
  visibility?: "Public" | "Private";
  userId?: string;
  webId?: string;
};

export function useSearchWebs(query: string, filters?: SearchFilter) {
  return useQuery({
    queryKey: ["webs", "search", query, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        query,
      });

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach((v) => params.append(key, v));
            } else {
              params.append(key, value.toString());
            }
          }
        });
      }

      const response = await api.get("/webs/search", { params });
      return response.data.result;
    },
    enabled: !!query,
  });
}

export function useFetchContributers(webId: string) {
  return useQuery({
    queryKey: ["webs", "contributers", webId],
    queryFn: async () => {
      const response = await api.get(`/webs/contributers/${webId}`);
      return response.data.result;
    },
    enabled: !!webId,
  });
}

export type ExportGraphPayload = {
  webId: string;
  selectedSources: string[];
  asMarkdown: boolean;
};

export function useExportGraph() {
  return useMutation({
    mutationFn: async ({
      webId,
      selectedSources,
      asMarkdown,
    }: ExportGraphPayload) => {
      const response = await api.post(
        `/webs/export/graph/context`,
        {
          webId,
          selectedSources,
          asMarkdown,
        },
        {
          responseType: asMarkdown ? "blob" : "json",
        }
      );
      if (asMarkdown) {
        return response.data;
      }

      return response.data.result;
    },
    onError: () => {
      console.error();
    },
  });
}

type InviteContributerPayload = {
  webId: string;
  emailToInvite: string;
};

export function useInviteContributer() {
  return useMutation({
    mutationFn: async (payload: InviteContributerPayload) => {
      const response = await api.post(`/webs/invite/contributer`, {
        webId: payload.webId,
        emailToInvite: payload.emailToInvite,
      });
      return response.data.result;
    },
    onError: () => {
      toast({
        title: "Error inviting contributer",
        description: "Contributer invitation failed",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Contributer invited successfully",
        description: "Contributer invited successfully",
      });
    },
  });
}
