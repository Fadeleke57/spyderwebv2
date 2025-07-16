"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Users, Globe } from "lucide-react";
import {
  useCheckAuthorizedUser,
  useAcceptInvite,
  useRejectInvite,
} from "@/hooks/contributors";
import { useUser } from "@/providers/UserProvider";
import { useFetchUserById } from "@/hooks/user";
import { useFetchWebById } from "@/hooks/webs";
import UserAvatar from "../utility/UserAvatar";

function InviteModal() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { webId } = router.query;
  const { data: web, isLoading: webLoading } = useFetchWebById(webId as string);
  const { user } = useUser();
  const { refetch: refetchContributors } = useCheckAuthorizedUser(
    webId as string
  );

  const {
    data: userAuthorization,
    isLoading: userAuthorizationLoading,
  } = useCheckAuthorizedUser(webId as string);

  const { invitePending, inviter } = userAuthorization || {
    invitePending: false,
    inviter: "",
  };

  const {
    data: invitedByUser,
    isLoading: invitedByUserLoading,
  } = useFetchUserById(inviter);

  const { mutateAsync: acceptInvite, isPending: acceptInviteLoading } =
    useAcceptInvite(webId as string);

  const { mutateAsync: rejectInvite, isPending: rejectInviteLoading } =
    useRejectInvite(webId as string);

  useEffect(() => {
    if (invitePending) {
      setOpen(true);
    }
  }, [invitePending]);

  const handleAcceptInvite = () => {
    if (!user) return;
    try {
      acceptInvite({ userId: user.id });
      refetchContributors();
      setOpen(false);
      router.push(`/web/${webId}`);
    } catch (error) {
      console.error("Failed to accept invite:", error);
    }
    toast({
      title: "Invite accepted",
      description: "Welcome to the web!",
    });
  };

  const handleRejectInvite = () => {
    if (!user) return;
    try {
      rejectInvite({ userId: user.id });
      refetchContributors();
      router.push(`/user/${user.username}`);
    } catch (error) {
      console.error("Failed to reject invite:", error);
    }
    toast({
      title: "Invite rejected",
      description: "You will have to wait for the owner to invite you again.",
    });
  };

  if (userAuthorizationLoading || invitedByUserLoading || webLoading) {
    return (
      <div className="p-8 rounded-lg border shadow-lg max-w-md mx-auto">
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-16 w-full" />
          <div className="flex gap-3 pt-4">
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-10 w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!invitedByUser || !web) {
    return null;
  }

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="sm:max-w-md overflow-hidden border-violet-200 dark:border-violet-200/50">
        {/* Main gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-400/10 via-violet-300/5 to-violet-500/10 dark:from-violet-400/20 dark:via-violet-400/10 dark:to-violet-600/20 -z-10" />

        <AlertDialogHeader className="pb-2">
          <div className="flex items-center gap-2 mb-1">
            <Badge
              variant="outline"
              className="bg-violet-400/10 dark:bg-violet-400/20 text-violet-700 dark:text-violet-300 border-violet-400/30 dark:border-violet-400/40 px-2 py-0.5 text-xs font-medium"
            >
              <Users className="w-3 h-3 mr-1" />
              Collaboration
            </Badge>
          </div>
          <AlertDialogTitle className="text-xl">
            Join Collaboration
          </AlertDialogTitle>
          <AlertDialogDescription>
            You&apos;ve been invited to join a collaborative web
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-violet-400/10 to-violet-500/5 dark:from-violet-400/15 dark:to-violet-500/10 border border-violet-400/20 dark:border-violet-400/30 backdrop-blur-sm">
            <UserAvatar dimension={48} userId={invitedByUser.id} deactive />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {invitedByUser.full_name}
                </span>{" "}
                <br />
                has invited you to join
              </p>
              <h3 className="font-bold text-lg truncate flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-violet-500 dark:text-violet-400" />
                {web.name}
              </h3>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            After accepting, you&apos;ll be able to access and collaborate on
            this web with other team members.
          </p>
        </div>

        <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-2">
          <AlertDialogCancel
            onClick={handleRejectInvite}
            className="w-full sm:w-1/2 border-violet-400/30 dark:border-violet-400/40 hover:bg-violet-400/5 dark:hover:bg-violet-400/10 transition-all duration-200 bg-transparent text-violet-700 dark:text-violet-300 hover:text-violet-800 dark:hover:text-violet-200"
            disabled={rejectInviteLoading}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Decline
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleAcceptInvite}
            className="w-full sm:w-1/2 bg-gradient-to-r from-violet-400/40 to-violet-500/40 dark:from-violet-400/40 dark:to-violet-500/40 border border-violet-400/50 dark:border-violet-400/50 hover:from-violet-400/60 hover:to-violet-500/60 dark:hover:from-violet-400/60 dark:hover:to-violet-500/60 transition-all duration-200 text-violet-900 dark:text-violet-100"
            disabled={acceptInviteLoading}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Accept Invite
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default InviteModal;
