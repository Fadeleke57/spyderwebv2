import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Bucket, UpdateBucket } from "@/types/bucket";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";

export function useFetchBuckets() {
  return useInfiniteQuery({
    queryKey: ["buckets"],
    queryFn: async ({ pageParam = { page: 1, direction: "forward" } }) => {
      const response = await api.get(`/buckets/all/user`, {
        params: {
          page: pageParam.page,
          page_size: 5,
        },
      });
      return {
        ...response.data,
      };
    },
    initialPageParam: { page: 1, direction: "forward" },
    getPreviousPageParam: (lastPage, allPages) => {
      return lastPage.prevCursor;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.nextCursor) return undefined;
      return { page: lastPage.nextCursor, direction: "forward" };
    },
  });
}

export function useFetchLikedBuckets() {
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await api.get("/buckets/liked/user");
        setBuckets(response.data.result);
      } catch (err) {
        setError("Failed to fetch bucket data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { buckets, loading, error };
}

export const useCreateBucket = () => {
  return useMutation({
    mutationFn: async (config: any) => {
      const response = await api.post("/buckets/create", config);
      return response.data.result;
    },
    onSuccess: () => {},
    onError: () => {},
  })
}

export function useDeleteBucket() {
  return useMutation({
    mutationFn: async (bucketId: string) => {
      const response = await api.delete("/buckets/delete", {
        params: { bucketId },
      });
      return response.data.result;
    },
    onSuccess: () => {},
    onError: () => {},
  })
}

export const useUpdateBucket = (bucketId: string) => {
  return useMutation({
    mutationFn: async (config: UpdateBucket) => {
      const response = await api.patch(`/buckets/update/${bucketId}`, config, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data.result;
    },
    onSuccess: () => {},
    onError: () => {},
  })
}

export function useFetchPublicBuckets() {
  const [buckets, setBuckets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await api.get("/buckets/all/public");
        setBuckets(response.data.result);
      } catch (err) {
        setError("Failed to fetch bucket data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { buckets, loading, error };
}

export const useFetchBucketById = (bucketId: string) => {
  return useQuery({
    queryKey: ["bucket", bucketId],
    queryFn: async () => {
      const response = await api.get(`/buckets/id`, {
        params: { bucketId },
      });
      return response.data.result;
    },
  });
}

export function useLikeBucket(bucketId: string) {
  return useMutation({
    mutationFn: async () => {
      const response = await api.post(`/buckets/like/${bucketId}`);
      return response.data.result;
    },
    onSuccess: () => {},
    onError: () => {},
  })
}

export function useUnlikeBucket(bucketId: string) {
  return useMutation({
    mutationFn: async () => {
      const response = await api.post(`/buckets/unlike/${bucketId}`);
      return response.data.result;
    },
    onSuccess: () => {},
    onError: () => {},
  })
}

export function useAddTagToBucket(bucketId: string) {
  return useMutation({
    mutationFn: async (tag: string) => {
      const response = await api.patch(`/buckets/add/tag/${bucketId}/${tag}`);
      return response.data.result;
    },
    onSuccess: () => {},
    onError: () => {},
  })
}

export function useRemoveTagFromBucket(bucketId: string) {
  return useMutation({
    mutationFn: async (tag: string) => {
      const response = await api.patch(`/buckets/remove/tag/${bucketId}/${tag}`);
      return response.data.result;
    },
    onSuccess: () => {},
    onError: () => {},
  })
}
