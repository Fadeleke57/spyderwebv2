import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { PublicUser, Search, UpdateUser } from "@/types/user";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

export function useCheckUserState() {
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user", "me", "state"],
    queryFn: async (): Promise<PublicUser | null> => {
      const token = localStorage.getItem("token");
      if (!token) {
        return null;
      }
      const response = await api.get("/auth/me");
      if (response.data) {
        return response.data;
      } else {
        return null;
      }
    },
    retry: false, //dont retry when error
  });

  const { mutate: logout } = useMutation({
    mutationFn: async () => {
      await api.post("/auth/logout");
      localStorage.removeItem("token");
    },
    onSuccess: () => {
      queryClient.setQueryData(["user"], null);
      queryClient.invalidateQueries({ queryKey: ["user"] });

      toast({
        title: "Logged out",
        description: "You have been logged out.",
      });
    },
  });

  return {
    user,
    isLoading,
    error,
    logout,
  };
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
  return useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await api.get(`/users/`, {
        params: { userId },
      });
      const data = await response.data.result;
      return data;
    },
    enabled: !!userId,
  });
}

export function useFetchUserByUsername(username: string) {
  return useQuery({
    queryKey: ["user", username],
    queryFn: async () => {
      if (!username) return null;
      const response = await api.get(`/users/username/${username}`);
      const data = await response.data.result;
      return data;
    },
    enabled: !!username,
  });
}

export function useEditUser() {
  return useMutation({
    mutationFn: async (updates: UpdateUser) => {
      const response = await api.patch(`/users/edit/`, updates, {
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.data.result;
      return data;
    },
    onError: (err: any) => {
      console.error(err);
    },
  });
}

export function useCheckEmailExists() {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await api.get(`/users/check/email/`, {
        params: { email },
      });
      const data = await response.data.result;
      return data;
    },
    onError: (err: any) => {
      console.error(err);
    },
  });
}

export function useHideWeb(webId: string) {
  return useMutation({
    mutationFn: async () => {
      const response = await api.patch(`/users/hide/web/${webId}`);
      const data = await response.data.result;
      return data;
    },
    onError: (err: any) => {
      console.error(err);
    },
  });
}

export function useUnhideWeb(webId: string) {
  return useMutation({
    mutationFn: async () => {
      const response = await api.patch(`/users/unhide/web/${webId}`);
      const data = await response.data.result;
      return data;
    },
    onError: (err: any) => {
      console.error(err);
    },
  });
}

export function useSaveWeb(webId: string) {
  return useMutation({
    mutationFn: async () => {
      const response = await api.patch(`/users/save/web/${webId}`);
      const data = await response.data.result;
      return data;
    },
    onError: (err: any) => {
      console.error(err);
    },
  });
}

export function usePinWeb(webId: string) {
  return useMutation({
    mutationFn: async () => {
      const response = await api.patch(`/users/pin/web/${webId}`);
      const data = await response.data.result;
      return data;
    },
    onError: (err: any) => {
      console.error(err);
    },
  });
}

export function useUnpinWeb(webId: string) {
  return useMutation({
    mutationFn: async () => {
      const response = await api.patch(`/users/unpin/web/${webId}`);
      const data = await response.data.result;
      return data;
    },
    onError: (err: any) => {
      console.error(err);
    },
  });
}

export function useFetchPinnedWebs(userId: string) {
  return useQuery({
    queryKey: ["user", "pinned", "webs"],
    queryFn: async () => {
      const response = await api.get(`/users/pinned/webs/${userId}`);
      const data = await response.data.result;
      return data;
    },
    enabled: !!userId,
  });
}

export function useUnsaveWeb(webId: string) {
  return useMutation({
    mutationFn: async () => {
      const response = await api.patch(`/users/unsave/web/${webId}`);
      const data = await response.data.result;
      return data;
    },
    onError: (err: any) => {
      console.error(err);
    },
  });
}

export function useFetchSavedWebs(userId: string) {
  return useQuery({
    queryKey: ["user", "saved", "webs"],
    queryFn: async () => {
      const response = await api.get(`/users/saved/webs/${userId}`);
      const data = await response.data.result;
      return data;
    },
    enabled: !!userId,
  });
}