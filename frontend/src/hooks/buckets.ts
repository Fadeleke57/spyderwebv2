import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { Bucket, UpdateBucket } from "@/types/bucket";

export function useFetchBuckets() {
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

    fetchData();
  }, []);

  return { buckets, loading, error };
}

export function useCreateBucket() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBucket = async (config: any) => {
    setLoading(true);
    console.log(config);
    try {
      const response = await api.post("/buckets/create", config);
    } catch (err) {
      setError("Failed to create bucket");
      console.error(err);
    } finally {
      toast({
        title: "Bucket created",
      });
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
      toast({
        title: "Bucket deleted",
        description: response.data.result,
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

  return { bucket, loading, error };
}

export function useLikeBucket(bucketId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const likeBucket = async () : Promise<number | null | undefined> => {
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

  const unlikeBucket = async () : Promise<number | null | undefined> => {
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