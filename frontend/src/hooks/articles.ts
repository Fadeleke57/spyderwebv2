import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Article } from "@/types/article";
import { toast } from "@/components/ui/use-toast";

function useFetchArticles(
  limit: number,
  query: string,
  setQuery: (value: string) => void
) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {

      try {
        const response = await api.get("/articles/", {
          params: { limit, query },
        });

        const fetchedArticles: Article[] = response.data.result.flatMap(
          (article: any) => article
        );
          setArticles(fetchedArticles);
          toast({
              title: `Found ${fetchedArticles.length} articles`,
          })
      } catch (err) {
        setError("Failed to fetch article data");
        console.error(err);
      } finally {
        setLoading(false);
      
      }
    };

    fetchData();
  }, [limit, query, setQuery]);

  return { articles, loading, error };
}

export default useFetchArticles;
