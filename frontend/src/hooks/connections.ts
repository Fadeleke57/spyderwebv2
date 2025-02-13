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
    });
};

export const useFetchOutgoingConnections = (bucketId: string, sourceId: string) => {
    return useQuery({
        queryKey: ["connections", "outgoing"],
        queryFn: async () => {
            const response = await api.get(`/connections/outgoing/${bucketId}/${sourceId}`);
            return response.data.result;
        },
    });
}

export const useFetchIncomingConnections = (bucketId: string, sourceId: string) => {
    return useQuery({
        queryKey: ["connections", "incoming"],
        queryFn: async () => {
            const response = await api.get(`/connections/incoming/${bucketId}/${sourceId}`);
            return response.data.result;
        },
    });
}

export const useGetConnection = (bucketId: string, connectionId: string) => {
    return useQuery({
        queryKey: ["connections", "connection", bucketId, connectionId],
        queryFn: async () => {
            const response = await api.get(`/connections/connection/${bucketId}/${connectionId}`);
            return response.data.result;
        },
    });
}

export const useCreateConnection = () => {
    return useMutation({
        mutationFn: async (config: CreateConnection) => {
            const response = await api.post(`/connections/create`, config);
            return response.data.result;
        },
        onSuccess: () => {},
        onError: () => {},
    });
}

export const useUpdateConnection = (connectionId: string) => {
    return useMutation({
        mutationFn: async (config: UpdateConnection) => {
            const response = await api.patch(`/connections/update/${connectionId}`, config);
            return response.data.result;
        },
        onSuccess: () => {},
        onError: () => {},
    });
}

export const useDeleteConnection = (connectionId: string) => {
    return useMutation({
        mutationFn: async () => {
            const response = await api.delete(`/connections/delete/${connectionId}`);
            return response.data.result;
        },
        onSuccess: () => {},
        onError: () => {},
    });
}