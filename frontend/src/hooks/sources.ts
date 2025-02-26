import api from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useFileUpload = (
  userId: string,
  webId: string,
  fileType: string
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return api
        .post(`/sources/upload/${userId}/${webId}/${fileType}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => res.data.key);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sources", webId] });
    },
    onError: (error: any) => {
      console.error("File upload failed:", error);
    },
  });
};

export const useFetchSourcesForBucket = (webId: string) => {
  return useQuery({
    queryKey: ["sources", webId],
    queryFn: async () => {
      const response = await api.get(`/sources/all/${webId}`);
      return response.data.result;
    },
    staleTime: 60000, //1 minute stale time
    retry: 2,
  });
};

export const useUploadWebsite = (webId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (url: string) => {
      const response = await api.post(`/sources/website/${webId}`, { url });
      return response.data.result;
    },
    onError: (error: any) => {
      console.error("Website upload failed:", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sources", webId] });
    },
  });
};

export const useUploadYoutube = (webId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (videoId: string) => {
      const response = await api.post(`/sources/youtube/${webId}/${videoId}`);
      return response.data.result;
    },
    onError: (error: any) => {
      console.error("YouTube upload failed:", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sources", webId] });
    },
  });
};

export const useRenderFile = (filePath: string) => {
  return useQuery({
    queryKey: ["render", "file", filePath],
    queryFn: async () => {
      const response = await api.get(
        `/sources/presigned/url/${encodeURIComponent(filePath)}`
      );
      return response.data.presigned_url;
    },
    enabled: !!filePath,
    staleTime: 300000, //5 minutes stale time
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

export const useUpdateNote = (bucketId: string, sourceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { title?: string; content?: string }) => {
      const response = await api.patch(
        `/sources/update/note/${bucketId}/${sourceId}`,
        payload
      );
      return response.data.result;
    },
    onError: (error: any) => {
      console.error("Note update failed:", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sources", bucketId] });
      queryClient.invalidateQueries({ queryKey: ["source", sourceId] });
    },
  });
};

export const useDeleteSource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sourceId: string) => {
      const response = await api.delete(`/sources/delete/source/${sourceId}`);
      return response.data.result;
    },
    onError: (error: any) => {
      console.error("Source deletion failed:", error);
    },
    onSuccess: (_, sourceId) => {
      queryClient.invalidateQueries({ queryKey: ["sources"] });
      queryClient.invalidateQueries({ queryKey: ["source", sourceId] });
    },
  });
};

export const useFetchSource = (sourceId: string, contextId?: string) => {
  return useQuery({
    queryKey: contextId
      ? ["source", sourceId, contextId]
      : ["source", sourceId],
    queryFn: async () => {
      const response = await api.get(`/sources/${sourceId}`);
      return response.data;
    },
    staleTime: 60000, //1 minute stale time
    retry: 2,
    enabled: !!sourceId,
  });
};

export const useEditSourceTitle = (sourceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (title: string) => {
      const response = await api.patch(`/sources/edit/source/${sourceId}`, {
        name: title,
      });
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
      sourceId,
      files,
    }: {
      sourceId: string;
      files: File[];
    }) => {
      const formData = new FormData();

      files.forEach((file) => {
        formData.append("files", file);
      });

      const { data } = await api.post(
        `/sources/upload/image/${sourceId}`,
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
