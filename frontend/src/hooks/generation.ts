import { useState } from "react";
import api from "@/lib/api";
import { Article, BucketConfigFormValues } from "@/types/article";

export function useCollectSourcesForBucket(
  bucketId: string,
  config: BucketConfigFormValues,
) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const claim = `Title: ${config.title}\n Description: ${config.description}`;
    const generateSourcesForBucket = async (): Promise<Article[] | null> => {
      setLoading(true);
      try {
        const response = await api.post(`/generation/start/process`, {
          bucketId,
          claim,
        });
      } catch (err) {
        setError("Failed to collect sources for bucket");
        console.error(err);
      } finally {
        setLoading(false);
      }
      return null;
    };

  return { generateSourcesForBucket, loading, error };
}
