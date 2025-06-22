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
    Object.entries(uploadData?.fields)?.forEach(([key, value]) => {
      formData.append(key, value);
    });

    // add the file last
    formData.append("file", file);

    try {
      const response = await fetch(uploadData.uploadUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`S3 upload failed: ${response.statusText}`);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error uploading file",
        description: "Please try again",
      });
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
