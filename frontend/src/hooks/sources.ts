import { toast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { useSourceStore } from "@/store/sourceStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface UploadFilesRequest {
  parseObsidianLinks: boolean;
  files: FileList;
}

interface S3UploadResponse {
  uploadUrl: string;
  fileKey: string;
  fields: Record<string, string>;
}

interface ProcessFileRequest {
  fileName: string;
  fileKey: string;
  fileSize: number;
  fileType: string;
}

export const useFileUpload = (webId: string) => {
  const queryClient = useQueryClient();
  const { setIsUploadingSource } = useSourceStore();

  // get presigned URLs from backend
  const getPresignedUrls = async (
    files: File[]
  ): Promise<S3UploadResponse[]> => {
    const fileInfos = files.map((file) => ({
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    }));

    const response = await api.post(`/sources/presigned-urls/${webId}`, {
      files: fileInfos,
    });

    return response.data.urls;
  };

  // upload files directly to S3
  const uploadToS3 = async (
    file: File,
    uploadData: S3UploadResponse
  ): Promise<string> => {
    const formData = new FormData();

    // add all the fields from the presigned URL
    Object.entries(uploadData.fields).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // add the file last
    formData.append("file", file);

    const response = await fetch(uploadData.uploadUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`S3 upload failed: ${response.statusText}`);
    }

    return uploadData.fileKey;
  };

  // notify backend to process uploaded files
  const processUploadedFiles = async (
    fileKeys: string[],
    files: File[],
    parseObsidianLinks: boolean
  ) => {
    const processRequests: ProcessFileRequest[] = files.map((file, index) => ({
      fileName: file.name,
      fileKey: fileKeys[index],
      fileSize: file.size,
      fileType: file.name.split(".").pop()?.toLowerCase() || "",
    }));

    const response = await api.post(
      `/sources/process-uploaded-files/${webId}`,
      {
        files: processRequests,
        preserve_obsidian_links: parseObsidianLinks,
      }
    );

    return {
      firstSourceId: response.data.result,
      process: response.data.process,
    };
  };

  return useMutation({
    mutationFn: async ({ parseObsidianLinks, files }: UploadFilesRequest) => {
      const fileArray = Array.from(files);
      setIsUploadingSource(true);

      try {
        // get presigned URLs
        const presignedUrls = await getPresignedUrls(fileArray);

        // upload all files to S3 in parallel
        const uploadPromises = fileArray.map((file, index) =>
          uploadToS3(file, presignedUrls[index])
        );

        const fileKeys = await Promise.all(uploadPromises);

        // notify backend to process the uploaded files
        const result = await processUploadedFiles(
          fileKeys,
          fileArray,
          parseObsidianLinks
        );

        return result;
      } catch (error) {
        console.error("Upload process failed:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sources", webId] });
    },
    onError: (error: any) => {
      console.error("File upload failed:", error);
    },
    onSettled: () => {
      setIsUploadingSource(false);
    },
  });
};

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
        `/sources/update/note/${webId}/${sourceId}`,
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
      toast({
        title: "Source deleted",
        description: "Source has been deleted successfully",
      });
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
    staleTime: 0, // Change this to 0 to always refetch
    retry: 2,
    enabled: !!sourceId,
    refetchOnMount: true, // Add this to ensure refetch on mount
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

export const useUploadVoiceNote = (webId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (blob: Blob) => {
      const formData = new FormData();
      formData.append(
        "file",
        new File([blob], "voice-note.webm", { type: "audio/webm" })
      );

      const response = await api.post(
        `/sources/upload/voice-note/${webId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data.result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["sources", webId] });
      // Invalidate this specific source if it exists in cache
      if (data && data.id) {
        queryClient.invalidateQueries({ queryKey: ["source", data.id] });
      }
    },
    onError: (error: any) => {
      console.error("Voice note upload failed:", error);
      toast({
        variant: "destructive",
        title: "Error uploading voice note",
        description: "Please try again",
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
