import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Article, ConfigFormValues } from "@/types/article";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/router";

export function useFetchArticles(
  limit: number,
  config: ConfigFormValues,
  setConfig: (value: ConfigFormValues) => void
) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { query, topic } = config;
      try {
        const response = await api.get("/articles/", {
          params: { limit, query, topic },
        });

        const fetchedArticles: Article[] = response.data.result.flatMap(
          (article: any) => article
        );
        setArticles(fetchedArticles);
        toast({
          title: `Found ${fetchedArticles.length} articles`,
        });
      } catch (err) {
        setError("Failed to fetch article data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [limit, config, setConfig]);

  return { articles, loading, error };
}

export function useFetchArticlesDemo(
  limit: number,
  config: ConfigFormValues,
  setConfig: (value: ConfigFormValues) => void
) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    //const queryCount = parseInt(localStorage.getItem("queryCount") || "0", 10);

    //if (queryCount >= 5) {
    //router.push("/login");
    //return;
    //}

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await api.get("/articles/demo", {
          params: { limit: limit, query: config.query, topic: config.topic },
        });
        const fetchedArticles: Article[] = response.data.result.flatMap(
          (article: any) => article
        );
        setArticles(fetchedArticles);

        //      localStorage.setItem("queryCount", (queryCount + 1).toString());
      } catch (err) {
        setError("Failed to fetch article data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [config, router, limit]);

  return { articles, loading, error };
}

export function useFetchArticleRelevantSentences(
  article_id: string,
  query: string
) {
  const [sentences, setSentences] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/articles/sentences/`, {
          params: {
            article_id: article_id || "",
            query: query ||  "",
          },
        });
        setSentences(response.data.result.sentences);
      } catch (err) {
        setError("Failed to fetch article data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [article_id, query]);

  return { sentences, loading, error };
}
