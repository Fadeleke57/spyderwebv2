import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { CreateConnection, UpdateConnection } from "@/types/connection";

export const useFetchAllConnectionsForBucket = (bucketId: string) => {
  return useQuery({
    queryKey: ["connections", "all", "bucket", bucketId],
    queryFn: async () => {
      const response = await api.get(`/connections/all/bucket/${bucketId}`);
      return response.data.result;
    },
    staleTime: 1000 * 60,
  });
};

export const useFetchOutgoingConnections = (
  bucketId: string,
  sourceId: string
) => {
  return useQuery({
    queryKey: ["connections", "outgoing", bucketId, sourceId],
    queryFn: async () => {
      const response = await api.get(
        `/connections/outgoing/${bucketId}/${sourceId}`
      );
      return response.data.result;
    },
  });
};

export const useFetchIncomingConnections = (
  bucketId: string,
  sourceId: string
) => {
  return useQuery({
    queryKey: ["connections", "incoming"],
    queryFn: async () => {
      const response = await api.get(
        `/connections/incoming/${bucketId}/${sourceId}`
      );
      return response.data.result;
    },
  });
};

export const useGetConnection = (bucketId: string, connectionId: string) => {
  return useQuery({
    queryKey: ["connections", "connection", bucketId, connectionId],
    queryFn: async () => {
      const response = await api.get(
        `/connections/connection/${bucketId}/${connectionId}`
      );
      return response.data.result;
    },
  });
};

export const useCreateConnection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (config: CreateConnection) => {
      const response = await api.post(`/connections/create`, config);
      return response.data.result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["connections", "all", "bucket", variables.bucketId],
      });
      queryClient.invalidateQueries({
        queryKey: ["connections", "outgoing", variables.bucketId],
      });
      queryClient.invalidateQueries({
        queryKey: ["connections", "incoming", variables.bucketId],
      });
    },
    onError: () => {},
  });
};

export const useUpdateConnection = (connectionId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (config: UpdateConnection) => {
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

export const useDeleteConnection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (connectionId: string) => {
      const response = await api.delete(`/connections/delete/${connectionId}`);
      return response.data.result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
    },
    onError: () => {},
  });
};
