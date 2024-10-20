import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { PublicUser, Search } from "@/types/user";

export function useFetchUser() {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          return;
        }

        const response = await api.get("/auth/me");

        setUser(response.data);
      } catch (error) {
        console.error("Failed to fetch user", error);
        setError("Failed to fetch user:" + error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);
  async function Logout() {
    setUser(null);
    await api.post("/auth/logout"); //backend session
    localStorage.removeItem("token"); //frontend session
    toast({
      title: "Logged out",
      description: "You have been logged out.",
    });
  }
  return { user, loading, error, Logout };
}

export function useFetchSearchHistory() {
  const [searchHistory, setSearchHistory] = useState<Search[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSearchHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No token found");
      }

      const response = await api.get("users/search/history");
      setSearchHistory(response.data.result);
    } catch (error) {
      console.error("Failed to fetch search history", error);
      setError("Failed to fetch search history: " + error);
      setSearchHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSearchHistory();
  }, []);

  return { searchHistory, loading, error, refetch: fetchSearchHistory };
}

export function useClearSearchHistory() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clearSearchHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }
      await api.delete("users/search/history");
    } catch (error) {
      console.error("Failed to clear search history", error);
      setError("Failed to clear search history:" + error);
    } finally {
      setLoading(false);
    }
  };
  return { loading, error, clearSearchHistory };
}

export function useFetchUserById(userId: string) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        if (!userId) {
          return;
        }
        const response = await api.get(`/users/`, {
          params: { userId },
        });
        setUser(response.data.result);
      } catch (error) {
        console.error("Failed to fetch user", error);
        setError("Failed to fetch user:" + error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);
  return { user, loading, error };
}
