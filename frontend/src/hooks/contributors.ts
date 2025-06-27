import { api } from "@/lib/api";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

export const useInviteContributor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      webId,
      emailToInvite,
    }: {
      webId: string;
      emailToInvite: string;
    }) => {
      const { data } = await api.post(
        `/contributor/invite/web/${webId}/contributor`,
        { emailToInvite }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contributor", "web"] });
      toast({
        title: "Success",
        description: "Contributor invited successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to invite contributor",
        variant: "destructive",
      });
    },
  });
};

export const useRevokeInvite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      webId,
      contributorId,
    }: {
      webId: string;
      contributorId: string;
    }) => {
      const { data } = await api.delete(
        `/contributor/revoke/invite/web/${webId}/contributor/${contributorId}`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contributor", "web"] });
      toast({
        title: "Success",
        description: "Invite revoked successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to revoke invite",
        variant: "destructive",
      });
    },
  });
};

export const useGetAllContributorsForWeb = (webId: string) => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ["contributor", "web", webId],
    queryFn: async () => {
      const { data } = await api.get(`/contributor/all/web/${webId}`);
      return data;
    },
    enabled: !!webId,
  });
};


export const useToggleContributorRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ webId, contributorId }: { webId: string; contributorId: string }) => {
            const { data } = await api.patch(`/contributor/toggle/web/${webId}/contributor/${contributorId}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["contributor", "web"] });
            toast({
                title: "Success",
                description: "Contributor role toggled successfully",
            });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to toggle contributor role",
                variant: "destructive",
            });
        },
    });
};

export const useDeleteContributor = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ webId, contributorId }: { webId: string; contributorId: string }) => {
            const { data } = await api.delete(`/contributor/delete/web/${webId}/contributor/${contributorId}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["contributor", "web"] });
            toast({
                title: "Success",
                description: "Contributor deleted successfully",
            });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to delete contributor",
                variant: "destructive",
            });
        },
    });
};

export const useAcceptInvite = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ webId, contributorId }: { webId: string; contributorId: string }) => {
            const { data } = await api.patch(`/contributor/accept/invite/web/${webId}/contributor/${contributorId}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["contributor", "web"] });
            toast({
                title: "Success",
                description: "Contributor accepted invite successfully",
            });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to accept invite",
                variant: "destructive",
            });
        },
    });
};
