import { toast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { useSourceStore } from "@/store/sourceStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useFetchSourcesForWeb = (webId: string) => {
  return useQuery({
    queryKey: ["sources", webId],
    queryFn: async () => {
      const response = await api.get(`/sources/all/${webId}`);
      return response.data.result;
    },
    enabled: !!webId,
    staleTime: 60000, //1 minute stale time
    retry: 2,
  });
};

export const useUploadWebsite = (webId: string) => {
  const queryClient = useQueryClient();
  const { setIsUploadingSource } = useSourceStore();
  return useMutation({
    mutationFn: async (url: string) => {
      setIsUploadingSource(true);
      const response = await api.post(`/sources/website/${webId}`, { url });
      return response.data.result;
    },
    onError: (error: any) => {
      console.error("Website upload failed:", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sources", webId] });
    },
    onSettled: () => {
      setIsUploadingSource(false);
    },
  });
};

export const useUploadYoutube = (webId: string) => {
  const queryClient = useQueryClient();
  const { setIsUploadingSource } = useSourceStore();
  return useMutation({
    mutationFn: async (videoId: string) => {
      setIsUploadingSource(true);
      const response = await api.post(`/sources/youtube/${webId}/${videoId}`);
      const { result, transcripts_found } = response.data;
      return { result, transcripts_found };
    },
    onError: (error: any) => {
      console.error("YouTube upload failed:", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sources", webId] });
    },
    onSettled: () => {
      setIsUploadingSource(false);
    },
  });
};

export const useUploadNote = (webId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      content,
    }: {
      title: string;
      content: string;
    }) => {
      const response = await api.post(`/sources/upload/note/${webId}`, {
        title,
        content,
      });
      return response.data.result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["sources", webId] });
      //invalidate this specific source if it exists in cache
      if (data && data.id) {
        queryClient.invalidateQueries({ queryKey: ["source", data.id] });
      }
    },
    onError: (error: any) => {
      console.error("Note upload failed:", error);
    },
  });
};

export const useUpdateNote = (webId: string, sourceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { title?: string; content?: string }) => {
      const response = await api.patch(
        `/sources/update/note/web/${webId}/source/${sourceId}`,
        payload
      );
      return response.data.result;
    },
    onError: (error: any) => {
      console.error("Note update failed:", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sources", webId] });
      queryClient.invalidateQueries({ queryKey: ["source", sourceId] });
    },
  });
};

export const useDeleteSource = (webId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sourceId: string) => {
      const response = await api.delete(
        `/sources/delete/web/${webId}/source/${sourceId}`
      );
      return response.data.result;
    },
    onError: (error: any) => {
      console.error("Source deletion failed:", error);
    },
    onSuccess: (_, sourceId) => {
      queryClient.invalidateQueries({ queryKey: ["sources"] });
      queryClient.invalidateQueries({ queryKey: ["source", sourceId] });
      toast({
        title: "Source deleted",
        description: "Source has been deleted successfully",
      });
    },
  });
};

export const useFetchSource = (
  webId: string,
  sourceId: string,
  contextId?: string
) => {
  return useQuery({
    queryKey: contextId
      ? ["source", sourceId, contextId]
      : ["source", sourceId],
    queryFn: async () => {
      const response = await api.get(
        `/sources/web/${webId}/source/${sourceId}`
      );
      return response.data;
    },
    staleTime: 60000, //1 minute stale time
    retry: 2,
    enabled: !!webId && !!sourceId,
  });
};

export const useEditSourceTitle = (webId: string, sourceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (title: string) => {
      if (!webId || !sourceId) return;
      const response = await api.patch(
        `/sources/edit/web/${webId}/source/${sourceId}`,
        {
          name: title,
        }
      );
      return response.data.result;
    },
    onError: (error: any) => {
      console.error("Source title edit failed:", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sources"] });
      queryClient.invalidateQueries({ queryKey: ["source", sourceId] });
    },
  });
};

export const useUploadImageToSource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      webId,
      sourceId,
      files,
    }: {
      webId: string;
      sourceId: string;
      files: File[];
    }) => {
      const formData = new FormData();

      files.forEach((file) => {
        formData.append("files", file);
      });

      const { data } = await api.post(
        `/sources/upload/image/web/${webId}/source/${sourceId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return data.imageUrls;
    },
    onError: (error: any) => {
      console.error("Image upload failed:", error);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sources"] });
      queryClient.invalidateQueries({
        queryKey: ["source", variables.sourceId],
      });
    },
  });
};

export const useFetchLinkPreviewData = (
  url: string,
  sourceId: string,
  disabled: boolean
) => {
  return useQuery({
    queryKey: ["link-preview", url],
    queryFn: async () => {
      const response = await api.get(`/sources/link/preview/`, {
        params: {
          url,
          sourceId,
        },
      });
      return response.data.result;
    },
    staleTime: 5000,
    retry: 2,
    enabled: !disabled && (!!url || !!sourceId),
    refetchOnMount: true,
  });
};
