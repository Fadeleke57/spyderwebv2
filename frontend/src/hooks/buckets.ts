import api from "@/lib/api";
import { Bucket, UpdateBucket } from "@/types/bucket";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";

export function useFetchUserBuckets(criteria?: string) {
  return useInfiniteQuery({
    queryKey: ["user", "buckets", criteria],
    queryFn: async ({ pageParam = { page: 1, direction: "forward" } }) => {
      const response = await api.get(`/buckets/all/user`, {
        params: {
          page: pageParam.page,
          page_size: 10,
          criteria: criteria,
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

export const useFetchLikedBuckets = () => {
  return useQuery({
    queryKey: ["buckets", "liked"],
    queryFn: async () => {
      const response = await api.get("/buckets/liked/user");
      return response.data.result;
    },
  });
}

export const useCreateBucket = () => {
  return useMutation({
    mutationFn: async (config: any) => {
      const response = await api.post("/buckets/create", config);
      return response.data.result;
    },
    onSuccess: () => {},
    onError: () => {},
  });
};

export const useFetchSavedBuckets = () => {
  return useQuery({
    queryKey: ["buckets", "saved"],
    queryFn: async () => {
      const response = await api.get("/buckets/saved/user");
      return response.data.result;
    },
  });
};

export const useUploadImageToBucket = () => {
  return useMutation({
    mutationFn: async ({
      bucketId,
      files,
    }: {
      bucketId: string;
      files: File[];
    }) => {
      const formData = new FormData();

      files.forEach((file) => {
        formData.append("files", file);
      });

      const { data } = await api.post(
        `/buckets/upload/image/${bucketId}`,
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

export const useDeleteImageFromBucket = () => {
  return useMutation({
    mutationFn: async ({
      bucketId,
      imageUrl,
    }: {
      bucketId: string;
      imageUrl: string;
    }) => {
      const imageName = imageUrl.split("/").pop();
      const response = await api.delete(
        `/buckets/delete/image/${bucketId}/${imageName}`
      );
      return response.data.result;
    },
  });
};

export function useGetAllImagesForBucket(bucketId: string) {
  return useQuery({
    queryKey: ["images", "bucket", bucketId],
    queryFn: async () => {
      const response = await api.get(`/buckets/images/bucket/${bucketId}`);
      return response.data.result;
    },
  });
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
  });
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
  });
};

export function useFetchPublicBuckets() {
  return useInfiniteQuery({
    queryKey: ["buckets", "public"],
    queryFn: async ({ pageParam = null }) => {
      const response = await api.get("/buckets/all/public", {
        params: {
          cursor: pageParam,
          limit: 10,
        },
      });
      return response.data;
    },
    initialPageParam: null,
    getNextPageParam: (lastPage, pages) => {
      return lastPage.nextCursor;
    },
  });
}

export function useFetchPopularBuckets(limit: number) {
  return useQuery({
    queryKey: ["buckets", "popular", limit],
    queryFn: async () => {
      const response = await api.get("/buckets/popular", {
        params: {
          limit,
        },
      });
      return response.data.result;
    },
  });
}

export const useFetchBucketById = (bucketId: string) => {
  return useQuery({
    queryKey: ["bucket", bucketId],
    queryFn: async () => {
      if (!bucketId) return null;
      const response = await api.get(`/buckets/id`, {
        params: { bucketId },
      });
      return response.data.result;
    },
  });
};

export function useLikeBucket(bucketId: string) {
  return useMutation({
    mutationFn: async () => {
      const response = await api.post(`/buckets/like/${bucketId}`);
      return response.data.result;
    },
    onSuccess: () => {},
    onError: () => {},
  });
}

export function useUnlikeBucket(bucketId: string) {
  return useMutation({
    mutationFn: async () => {
      const response = await api.post(`/buckets/unlike/${bucketId}`);
      return response.data.result;
    },
    onSuccess: () => {},
    onError: () => {},
  });
}

export function useAddTagToBucket(bucketId: string) {
  return useMutation({
    mutationFn: async (tag: string) => {
      const response = await api.patch(`/buckets/add/tag/${bucketId}/${tag}`);
      return response.data.result;
    },
    onSuccess: () => {},
    onError: () => {},
  });
}

export function useRemoveTagFromBucket(bucketId: string) {
  return useMutation({
    mutationFn: async (tag: string) => {
      const response = await api.patch(
        `/buckets/remove/tag/${bucketId}/${tag}`
      );
      return response.data.result;
    },
    onSuccess: () => {},
    onError: () => {},
  });
}

export type IterateBucketPayload = {
  name: string;
  description: string;
};

export function useIterateBucket(bucketId: string) {
  return useMutation({
    mutationFn: async (config: IterateBucketPayload) => {
      const response = await api.post(`/buckets/iterate/${bucketId}`, config);
      return response.data.result;
    },
    onSuccess: () => {},
    onError: () => {},
  });
}

export type SearchFilter = {
  visibility?: "Public" | "Private";
  userId?: string;
  bucketId?: string;
};

export function useSearchBuckets(query: string, filters?: SearchFilter) {
  return useQuery({
    queryKey: ["buckets", "search", query, filters],
    queryFn: async () => {
      //convert filters object into URL parameters
      const params = new URLSearchParams({
        query,
      });

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) { //handle array filters
              value.forEach((v) => params.append(key, v));
            } else {
              params.append(key, value.toString());
            }
          }
        });
      }

      const response = await api.get("/buckets/search", { params });
      return response.data.result;
    },
    enabled: !!query,
  });
}
