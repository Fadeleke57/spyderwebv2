import { useState, useCallback, useEffect } from "react";
import api from "@/lib/api";
export const useFileUpload = (userId: string, webId: string) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const uploadFile = useCallback(
    async (file: File, fileType: string) => {
      setIsUploading(true);
      setError(null);
      setProgress(0);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await api.post(
          `/sources/upload/${userId}/${webId}/${fileType}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            onUploadProgress: (progressEvent) => {
              setProgress(
                Math.round(
                  (progressEvent.loaded * 100) / (progressEvent?.total || 0)
                )
              );
            },
          }
        );

        const data = await response.data.result;
        return data;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setIsUploading(false);
        setProgress(100);
      }
    },
    [userId, webId]
  );

  return {
    uploadFile,
    isUploading,
    error,
    progress,
  };
};

export const useFileList = (
  userId: string,
  webId: string,
  fileType?: string
) => {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get(
        `/files?user_id=${userId}&web_id=${webId}${
          fileType ? `&file_type=${fileType}` : ""
        }`
      );

      const data = await response.data.result;
      setFiles(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userId, webId, fileType]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  return {
    files,
    isLoading,
    error,
    refreshFiles: fetchFiles,
  };
};

export const useFetchSourcesForBucket = (webId: string) => {
  const [sources, setSources] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSources = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get(`/sources/all/${webId}`);
      const data = await response.data.result;
      setSources(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  return {
    sources,
    isLoading,
    error,
    refreshSources: fetchSources,
  };
};
