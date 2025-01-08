import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Bucket, UpdateBucket } from "@/types/bucket";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";

export function useFetchBucketsForUser(criteria?: string) {
  return useInfiniteQuery({
    queryKey: ["user", "buckets"],
    queryFn: async ({ pageParam = { page: 1, direction: "forward" } }) => {
      const response = await api.get(`/buckets/all/user`, {
        params: {
          page: pageParam.page,
          page_size: 5,
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

      return data.imageKeys;
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
      console.log("imageUrl", imageUrl);
      console.log("imageName", imageName);
      const response = await api.delete(`/buckets/delete/image/${bucketId}/${imageName}`);
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
  //will make an infinite query in the future [will need to adjust search endpoint]
  return useQuery({
    queryKey: ["buckets", "public"],
    queryFn: async () => {
      const response = await api.get("/buckets/all/public");
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

export function useFetchPopularBuckets() {
  return useQuery({
    queryKey: ["buckets", "popular"],
    queryFn: async () => {
      const response = await api.get("/buckets/popular");
      return response.data.result;
    },
  });
}
