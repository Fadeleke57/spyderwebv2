import { api } from "@/lib/api";
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast"

export const useInviteContributor = (webId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ emailToInvite }: { emailToInvite: string }) => {
      const { data } = await api.post(
        `/contributors/invite/web/${webId}/contributor`,
        { emailToInvite }
      );
      return data.result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["contributors", "web", webId],
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Inviting User",
        description:
          error?.response?.data?.detail ||
          error.detail ||
          "An unexpected error occurred.",
        variant: "destructive",
      });
    },
  });
};

export const useRevokeInvite = (webId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ contributorId }: { contributorId: string }) => {
      const { data } = await api.delete(
        `/contributors/revoke/invite/web/${webId}/contributor/${contributorId}`
      );
      return data.result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["contributors", "web", webId],
      });
    },
    onError: (error: any) => {
      toast({

      })
    },
  });
};

export const useGetAllContributorsForWeb = (webId: string) => {
  return useQuery({
    queryKey: ["contributors", "web", webId],
    queryFn: async () => {
      const { data } = await api.get(`/contributors/all/web/${webId}`);
      return data.result;
    },
    enabled: !!webId,
    staleTime: 30000,
    retry: 3,
  });
};

export const useToggleContributorRole = (webId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      contributorId,
      role,
    }: {
      contributorId: string;
      role: string;
    }) => {
      const { data } = await api.patch(
        `/contributors/toggle/web/${webId}/contributor/${contributorId}`,
        { role }
      );
      return data.result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["contributors", "web", webId],
      });
    },
    onError: (error: any) => {
      console.error("Toggle contributor role mutation error:", error);
    },
  });
};

export const useDeleteContributor = (webId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ contributorId }: { contributorId: string }) => {
      const { data } = await api.delete(
        `/contributors/delete/web/${webId}/contributor/${contributorId}`
      );
      return data.result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["contributors", "web", webId],
      });
    },
    onError: (error: any) => {
      console.error("Delete contributor mutation error:", error);
    },
  });
};

export const useAcceptInvite = (webId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const { data } = await api.patch(
        `/contributors/accept/invite/web/${webId}/contributor/${userId}`
      );
      return data.result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["contributors", "web", webId],
      });
      queryClient.invalidateQueries({
        queryKey: ["authorization", "web", webId],
      });
    },
    onError: (error: any) => {
      console.error("Accept invite mutation error:", error);
    },
  });
};

export const useRejectInvite = (webId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const { data } = await api.delete(
        `/contributors/reject/invite/web/${webId}/contributor/${userId}`
      );
      return data.result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["contributors", "web", webId],
      });
    },
    onError: (error: any) => {
      console.error("Reject invite mutation error:", error);
    },
  });
};

export const useCheckAuthorizedUser = (
  webId: string | null
): UseQueryResult<{
  accessLevel: string;
  invitePending: boolean;
  inviter: string;
}> => {
  return useQuery({
    queryKey: ["authorization", "web", webId],
    queryFn: async () => {
      const { data } = await api.get(
        `/contributors/check/authorized/web/${webId}`
      );
      console.log("Authorization data:", data);
      return {
        accessLevel: data.result,
        invitePending: data.invite,
        inviter: data.inviter,
      };
    },
    enabled: !!webId,
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: 3,
  });
};
