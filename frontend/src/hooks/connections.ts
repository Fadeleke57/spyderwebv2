import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CreateConnection, UpdateConnection } from "@/types/connection";

export const useFetchAllConnectionsForWeb = (webId?: string | null) => {
  return useQuery({
    queryKey: ["connections", "all", "web", webId],
    queryFn: async () => {
      const response = await api.get(`/connections/all/web/${webId}`);
      return response.data.result;
    },
    staleTime: 1000 * 60,
    enabled: !!webId,
  });
};

export const useFetchOutgoingConnections = (
  webId?: string | null,
  sourceId?: string | null
) => {
  return useQuery({
    queryKey: ["connections", "outgoing", webId, sourceId],
    queryFn: async () => {
      const response = await api.get(
        `/connections/outgoing/${webId}/${sourceId}`
      );
      return response.data.result;
    },
    enabled: !!webId && !!sourceId,
  });
};

export const useFetchIncomingConnections = (
  webId?: string | null,
  sourceId?: string | null
) => {
  return useQuery({
    queryKey: ["connections", "incoming"],
    queryFn: async () => {
      const response = await api.get(
        `/connections/incoming/${webId}/${sourceId}`
      );
      return response.data.result;
    },
    enabled: !!webId && !!sourceId,
  });
};

export const useGetConnection = (webId?: string | null, connectionId?: string | null) => {
  return useQuery({
    queryKey: ["connections", "connection", webId, connectionId],
    queryFn: async () => {
      const response = await api.get(
        `/connections/connection/${webId}/${connectionId}`
      );
      return response.data.result;
    },
    enabled: !!webId && !!connectionId,
    });
};

export const useCreateConnection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (config: CreateConnection) => {
      const response = await api.post(`/connections/create/${config.webId}`, config);
      return response.data.result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["connections", "all", "web", variables.webId],
      });
      queryClient.invalidateQueries({
        queryKey: ["connections", "outgoing", variables.webId],
      });
      queryClient.invalidateQueries({
        queryKey: ["connections", "incoming", variables.webId],
      });
    },
    onError: () => {},
  });
};

export const useUpdateConnection = (connectionId?: string | null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (config: UpdateConnection) => {
      if (!connectionId) return;
      const response = await api.patch(
        `/connections/update/${connectionId}`,
        config
      );
      return response.data.result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
    },
    onError: () => {},
  });
};

export const useDeleteConnection = (webId?: string | null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (connectionId: string) => {
      if (!webId) return;
      const response = await api.delete(`/connections/delete/web/${webId}/connection/${connectionId}`);
      return response.data.result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
    },
    onError: () => {},
  });
};
