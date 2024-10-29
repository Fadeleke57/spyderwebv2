import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { Bucket, UpdateBucket } from "@/types/bucket";
import { Article } from "@/types/article";

export function useFetchBuckets() {
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get("/buckets/all/user");
      setBuckets(response.data.result);
    } catch (err) {
      setError("Failed to fetch bucket data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const refetch = () => {
    setLoading(true);
    fetchData();
  };
  useEffect(() => {
    fetchData();
  }, []);

  return { buckets, loading, error, refetch };
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

export function useCreateBucket() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBucket = async (config: any) => {
    setLoading(true);
    try {
      const response = await api.post("/buckets/create", config);
    } catch (err) {
      setError("Failed to create bucket");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { createBucket, loading, error };
}

export function useDeleteBucket() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteBucket = async (bucketId: string) => {
    setLoading(true);
    try {
      const response = await api.delete("/buckets/delete", {
        params: { bucketId },
      });
    } catch (err) {
      setError("Failed to delete bucket");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { deleteBucket, loading, error };
}

export function useUpdateBucket(bucketId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateBucket = async (config: UpdateBucket) => {
    setLoading(true);
    try {
      const response = await api.patch(`/buckets/update/${bucketId}`, config, {
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      setError("Failed to update bucket");
      console.error(err);
      return;
    } finally {
      setLoading(false);
    }
  };

  return { updateBucket, loading, error };
}

export function useFetchPublicBuckets() {
  const [buckets, setBuckets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
        await delay(2000);
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

export function useFetchBucketById(bucketId: string) {
  const [bucket, setBucket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = () => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/buckets/id`, {
          params: { bucketId },
        });
        setBucket(response.data.result);
      } catch (err) {
        setError("Failed to fetch bucket data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/buckets/id`, {
          params: { bucketId },
        });
        setBucket(response.data.result);
      } catch (err) {
        setError("Failed to fetch bucket data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bucketId]);

  return { bucket, loading, error, refetch };
}

export function useLikeBucket(bucketId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const likeBucket = async (): Promise<number | null | undefined> => {
    setLoading(true);
    try {
      const response = await api.post(`/buckets/like/${bucketId}`);
      return response.data.result;
    } catch (err) {
      setError("Failed to like bucket");
      console.error(err);
      return;
    } finally {
      setLoading(false);
    }
  };

  return { likeBucket, loading, error };
}

export function useUnlikeBucket(bucketId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unlikeBucket = async (): Promise<number | null | undefined> => {
    setLoading(true);
    try {
      const response = await api.post(`/buckets/unlike/${bucketId}`);
      return response.data.result;
    } catch (err) {
      setError("Failed to unlike bucket");
      console.error(err);
      return;
    } finally {
      setLoading(false);
    }
  };

  return { unlikeBucket, loading, error };
}

export function useAddTagToBucket(bucketId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addTagToBucket = async (tag: string) => {
    setLoading(true);
    try {
      const response = await api.patch(`/buckets/add/tag/${bucketId}/${tag}`);
    } catch (err) {
      setError("Failed to add tag to bucket");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { addTagToBucket, loading, error };
}

export function useRemoveTagFromBucket(bucketId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const removeTagFromBucket = async (tag: string) => {
    setLoading(true);
    try {
      const response = await api.patch(
        `/buckets/remove/tag/${bucketId}/${tag}`
      );
    } catch (err) {
      setError("Failed to remove tag from bucket");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  return { removeTagFromBucket, loading, error };
}

export function useFetchArticlesForBucket(bucketId: string) {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/buckets/articles/${bucketId}`);
        const fetchedArticles: Article[] = response.data.result.flatMap(
          (article: any) => article
        );
        setArticles(fetchedArticles);
      } catch (err) {
        setError("Failed to fetch bucket data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bucketId]);
  return { articles, loading, error };
}
