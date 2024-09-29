import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "@/components/ui/use-toast";

export function useFetchBuckets() {
  const [buckets, setBuckets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await api.get("/buckets/all");
        setBuckets(response.data.result);
        toast({
          title: `Found ${response.data.result.length} buckets`,
        });
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

      toast({
        title: "Bucket created",
        description: response.data.result,
      });
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

export function useUpdateBucket() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateBucket = async (config: any) => {
    setLoading(true);
    try {
      const response = await api.put("/buckets/update", config);
      toast({
        title: "Bucket updated",
        description: response.data.result,
      });
    } catch (err) {
      setError("Failed to update bucket");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { updateBucket, loading, error };
}
