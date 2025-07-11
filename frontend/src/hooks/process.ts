import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const useFetchProcess = (processId?: string | null) => {
  return useQuery({
    queryKey: ["process", processId],
    queryFn: async () => {
      const response = await api.get(`/processes/process/${processId}`);
      return response.data;
    },
    staleTime: 60000, //1 minute stale time
    retry: 2,
    enabled: !!processId,
  });
};

export const useFetchAllProcesses = (webId?: string | null) => {
  return useQuery({
    queryKey: ["process", "all", webId],
    queryFn: async () => {
      const response = await api.get(`/processes/all/${webId}`);
      return response.data.result;
    },
    staleTime: 60000, //1 minute stale time
    retry: 2,
    enabled: !!webId,
  });
};

export const useCheckAutolinkerStatus = (webId?: string | null, sourceId?: string | null) => {
  return useQuery({
    queryKey: ["process", "status", webId, sourceId],
    queryFn: async () => {
      const response = await api.get(
        `/processes/status/${webId}/${sourceId}`
      );
      return response.data.result;
    },
    enabled: !!webId && !!sourceId,
  })
};
