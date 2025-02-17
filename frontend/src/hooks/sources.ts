import api from "@/lib/api";
import { useQuery, useMutation } from "@tanstack/react-query";

export const useFileUpload = (
  userId: string,
  webId: string,
  fileType: string
) => {
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
  });
};

export const useFetchSourcesForBucket = (webId: string) => {
  return useQuery({
    queryKey: ["sources", webId],
    queryFn: async () => {
      if (!webId) return null;
      const response = await api.get(`/sources/all/${webId}`);
      const data = await response.data.result;
      return data;
    },
  });
};

export const useUploadWebsite = (webId: string) => {
  return useMutation({
    mutationFn: async (url: string) => {
      const resonse = await api.post(`/sources/website/${webId}`, { url });
      return resonse.data.result;
    },
    onError: (err: any) => {
      console.error(err);
    },
  });
};

export const useUploadYoutube = (webId: string) => {
  return useMutation({
    mutationFn: async (videoId: string) => {
      const resonse = await api.post(`/sources/youtube/${webId}/${videoId}`);
      return resonse.data.result;
    },
    onError: (err: any) => {
      console.error(err);
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
      const data = await response.data.presigned_url;
      return data;
    },
    enabled: false,
  });
};

export const useUploadNote = (webId: string) => {
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
      const data = await response.data.result;
      return data;
    },
  });
};

export const useUpdateNote = (bucketId: string, sourceId: string) => {
  return useMutation({
    mutationFn: async (payload: { title?: string; content?: string }) => {
      const response = await api.patch(
        `/sources/update/note/${bucketId}/${sourceId}`,
        payload
      );
      const data = await response.data.result;
      return data;
    },
    onError: (err: any) => {
      console.error(err);
    },
  });
};

export const useDeleteSource = () => {
  return useMutation({
    mutationFn: async (sourceId: string) => {
      const response = await api.delete(`/sources/delete/source/${sourceId}`);
      const data = await response.data.result;
      return data;
    },
    onError: (err: any) => {
      console.error(err);
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
      const data = await response.data;
      return data;
    },
  });
};

export const useEditSourceTitle = (sourceId: string) => {
  return useMutation({
    mutationFn: async (title: string) => {
      const response = await api.patch(`/sources/edit/source/${sourceId}`, {
        name: title,
      });
      const data = await response.data.result;
      return data;
    },
    onError: (err: any) => {
      console.error(err);
    },
  });
};

export const useUploadImageToSource = () => {
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
  });
};
