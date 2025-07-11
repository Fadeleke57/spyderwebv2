"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  Check,
  CheckIcon,
  Copy,
  EllipsisIcon,
  Forward,
  Send,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRouter } from "next/router";
import { environment } from "@/environment/loadenv";
import UserAvatar from "./UserAvatar";
import { useUser } from "@/providers/UserProvider";
import { useFetchWebById } from "@/hooks/webs";
import {
  useInviteContributor,
  useGetAllContributorsForWeb,
  useDeleteContributor,
  useToggleContributorRole,
  useRevokeInvite,
} from "@/hooks/contributors";
import { useFetchUserById } from "@/hooks/user";
import { AccessLevel, Contributor } from "@/types/contributor";
import { Skeleton } from "../ui/skeleton";
import { useAuthorization } from "@/providers/AuthorizationProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const FormSchema = z.object({
  inviteContributers: z.string().email("Please enter a valid email").optional(),
});

const ContributorItem = ({ contributor }: { contributor: Contributor }) => {
  const router = useRouter();
  const { webId } = router.query;
  const { isOwner } = useAuthorization();
  const { user } = useUser();

  const { refetch: refetchContributors } = useGetAllContributorsForWeb(
    webId as string
  );

  const {
    mutateAsync: removeContributor,
    isPending: removeContributorPending,
  } = useDeleteContributor(webId as string);
  const {
    mutateAsync: toggleContributorRole,
    isPending: toggleContributorRolePending,
  } = useToggleContributorRole(webId as string);
  const { mutateAsync: revokeInvite, isPending: revokeInvitePending } =
    useRevokeInvite(webId as string);

  const handleRemoveContributor = useCallback(
    async (contributorId: string) => {
      try {
        await removeContributor({ contributorId });
        toast({
          title: "Contributor removed",
          description: "Access has been revoked for the user.",
        });
        await refetchContributors();
      } catch (error: any) {
        console.error("Failed to remove contributor", error);
        toast({
          title: "Failed to remove contributor",
          description:
            error?.response?.data?.detail ||
            error.detail ||
            "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    },
    [removeContributor, refetchContributors]
  );

  const handleRoleChange = useCallback(
    async (contributorId: string, role: AccessLevel) => {
      try {
        await toggleContributorRole({ contributorId, role });
        toast({
          title: "Role updated",
          description: "Contributor's access level has been changed.",
        });
        await refetchContributors();
      } catch (error: any) {
        console.error("Failed to update role", error);
        toast({
          title: "Failed to update role",
          description:
            error?.response?.data?.detail ||
            error.detail ||
            "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    },
    [toggleContributorRole, refetchContributors]
  );

  const handleRevokeInvite = useCallback(
    async (contributorId: string) => {
      try {
        await revokeInvite({ contributorId });
        toast({
          title: "Invite revoked",
          description: "The invitation has been canceled.",
        });
        await refetchContributors();
      } catch (error: any) {
        console.error("Failed to revoke invite", error);
        toast({
          title: "Failed to revoke invite",
          description:
            error?.response?.data?.detail ||
            error.detail ||
            "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    },
    [revokeInvite, refetchContributors]
  );

  return (
    <div className="flex w-full items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <UserAvatar dimension={30} userId={contributor.userId} showTooltip />
        <div className="flex flex-col">
          <p className="text-sm">{contributor.username || "Contributor"}</p>
          {contributor.pending && (
            <span className="text-xs text-muted-foreground font-semibold">
              Pending invite
            </span>
          )}
        </div>
      </div>
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={`p-0 justify-end bg-transparent -mr-1 border-none text-xs h-8 ring-0 focus:ring-0 focus:ring-offset-0 hover:bg-transparent hover:opacity-75 ${
                contributor.pending || !isOwner ? "hidden" : ""
              }`}
              disabled={
                contributor.pending ||
                !isOwner ||
                removeContributorPending ||
                toggleContributorRolePending
              }
            >
              {contributor &&
                contributor.accessLevel[0].toUpperCase() +
                  contributor.accessLevel.slice(1)}
              <EllipsisIcon size={14} className="ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="cursor-pointer">
            <DropdownMenuItem
              className="flex items-center justify-between cursor-pointer"
              onClick={() =>
                handleRoleChange(contributor.contributorId, "read")
              }
            >
              Read
              {contributor.accessLevel === "read" && <CheckIcon size={14} />}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center justify-between cursor-pointer"
              onClick={() =>
                handleRoleChange(contributor.contributorId, "write")
              }
            >
              Write
              {contributor.accessLevel === "write" && <CheckIcon size={14} />}
            </DropdownMenuItem>
            {isOwner && (
              <DropdownMenuItem
                className="flex items-center justify-between cursor-pointer"
                onClick={() =>
                  handleRoleChange(contributor.contributorId, "owner")
                }
              >
                Owner
                {contributor.accessLevel === "owner" && <CheckIcon size={14} />}
              </DropdownMenuItem>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  disabled={removeContributorPending || revokeInvitePending}
                  className="text-red-400 cursor-pointer hover:text-red-400/80 dark:hover:text-red-400/80"
                >
                  {contributor && user && contributor.userId === user.id
                    ? "Leave Project"
                    : "Remove Access"}
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {contributor && user && contributor.userId === user.id
                      ? "Are you sure you want to leave?"
                      : "Are you sure you want to remove access?"}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {contributor && user && contributor.userId === user.id
                      ? "You will lose access to this project. This action cannot be undone and you will have to ask the owner to invite you back."
                      : `This will permanently remove ${contributor.username || "this user"}'s access to the project. They will have to wait for the owner to invite them back.`}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() =>
                      handleRemoveContributor(contributor.contributorId)
                    }
                    className="bg-transparent dark:bg-transparent dark:hover:bg-transparent hover:bg-transparent text-red-400 hover:text-red-400/80 dark:text-red-400 dark:hover:text-red-400/80"
                  >
                    {contributor && user && contributor.userId === user.id
                      ? "Leave"
                      : "Remove"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>

        {contributor.pending && isOwner && (
          <Button
            disabled={revokeInvitePending}
            variant="ghost"
            size="sm"
            type="button"
            className="text-red-400 hover:text-red-400/80 font-semibold text-xs px-2 pr-0 bg-transparent dark:bg-transparent dark:hover:bg-transparent hover:bg-transparent"
            onClick={() => handleRevokeInvite(contributor.contributorId)}
          >
            Revoke
          </Button>
        )}
      </div>
    </div>
  );
};

const ShareForm = ({ form, webOwner, copied, handleCopy }: any) => {
  const router = useRouter();
  const { webId } = router.query;

  const { isOwner, canRead, authLoading } = useAuthorization();

  const { mutateAsync: inviteContributor, isPending: inviteRequestPending } =
    useInviteContributor(webId as string);

  const {
    data: contributors,
    isLoading: contributorsLoading,
    error: contributorsError,
    refetch: refetchContributors,
  } = useGetAllContributorsForWeb(webId as string);

  const handleInviteUser = useCallback(async () => {
    const emailToInvite = form.getValues("inviteContributers")?.trim();

    if (!emailToInvite) {
      toast({
        title: "Email required",
        description: "Please enter an email address to invite.",
        variant: "destructive",
      });
      return;
    }

    if (form.formState.errors.inviteContributers) {
      return;
    }

    if (!webOwner) {
      toast({
        title: "Owner not found",
        description: "Owner not found.",
        variant: "destructive",
      });
      return;
    }

    if (emailToInvite === webOwner.email) {
      toast({
        title: "Cannot invite owner",
        description: "You can't invite the project owner.",
        variant: "destructive",
      });
      return;
    }

    // Check if user is already invited or has access
    const existingContributor = contributors?.find(
      (c: Contributor) => c.email?.toLowerCase() === emailToInvite.toLowerCase()
    );

    if (existingContributor) {
      toast({
        title: "User already has access",
        description: `${emailToInvite} ${existingContributor.pending ? "is already invited." : "already has access."}`,
        variant: "destructive",
      });
      return;
    }

    try {
      await inviteContributor({
        emailToInvite: emailToInvite,
      });

      toast({
        title: "Invitation sent!",
        description: `An invite has been sent to ${emailToInvite}.`,
      });

      form.reset();
      // Wait a bit for the backend to process before refetching
      setTimeout(() => {
        refetchContributors();
      }, 500);
    } catch (error: any) {
      console.error("Failed to invite user", error);
      toast({
        title: "Failed to send invitation",
        description:
          error?.response?.data?.detail ||
          error.detail ||
          "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  }, [form, inviteContributor, refetchContributors, webOwner, contributors]);

  // Show loading state for both authorization and contributors
  const isLoading = authLoading || contributorsLoading;

  return (
    <Form {...form}>
      <form className="space-y-4">
        {isOwner && (
          <FormField
            control={form.control}
            name="inviteContributers"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">
                  Invite Contributors
                </FormLabel>
                <FormMessage className="text-xs text-red-400" />
                <div className="flex items-center gap-2 border rounded-md">
                  <Input
                    className="flex-1 border-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0 transition-none"
                    placeholder="Enter email address"
                    {...field}
                    disabled={inviteRequestPending}
                  />
                  <Button
                    variant="ghost"
                    className="hover:bg-transparent hover:opacity-80 transition-all duration-200 bg-transparent"
                    type="button"
                    size="icon"
                    onClick={handleInviteUser}
                    disabled={inviteRequestPending}
                  >
                    <Send strokeWidth={2} size={14} />
                  </Button>
                </div>
              </FormItem>
            )}
          />
        )}

        {!canRead && (
          <Input
            className="flex-1 transition-none"
            value={window.location.href}
            readOnly
          />
        )}

        {canRead && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">
              People with access
            </p>

            <div className="flex flex-col max-h-[200px] overflow-y-auto gap-3 no-scrollbar">
              {/* Always show owner first */}
              {webOwner && (
                <div className="flex w-full items-center justify-between gap-2 p-2 rounded-lg bg-muted/20">
                  <div className="flex items-center gap-2">
                    <UserAvatar
                      dimension={30}
                      userId={webOwner.id}
                      showTooltip
                    />
                    <p className="text-sm font-medium">{webOwner.full_name}</p>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    Owner
                  </span>
                </div>
              )}

              {/* Loading state */}
              {isLoading && (
                <div className="flex flex-col gap-1">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <div className="flex items-center gap-2 px-2" key={index}>
                      <Skeleton className="w-[30px] h-[30px] rounded-full" />
                      <Skeleton className="w-full h-4" />
                    </div>
                  ))}
                </div>
              )}

              {/* Error state */}
              {contributorsError && !isLoading && (
                <div className="p-3 text-center text-sm text-muted-foreground">
                  <p>Failed to load contributors</p>
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    className="mt-2"
                    onClick={() => refetchContributors()}
                  >
                    Retry
                  </Button>
                </div>
              )}

              {/* Contributors list */}
              {contributors && Array.isArray(contributors) && !isLoading && (
                <>
                  {contributors.length === 0 ? (
                    <div className="p-3 text-center text-sm text-muted-foreground">
                      No contributors yet
                    </div>
                  ) : (
                    contributors.map((contributor: Contributor) => (
                      <div key={contributor.contributorId} className="px-2">
                        <ContributorItem contributor={contributor} />
                      </div>
                    ))
                  )}
                </>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-6 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            size={"sm"}
            className="justify-center gap-2 text-sm border dark:bg-violet-400/40 dark:border-violet-400/30 dark:hover:bg-violet-400/60"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check size={14} /> Copied!
              </>
            ) : (
              <>
                <Copy size={14} /> Copy Link
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

const SharePopover = () => {
  const isMobile = useIsMobile();
  const router = useRouter();
  const { webId } = router.query;
  const { data: webData } = useFetchWebById(webId as string);
  const { data: webOwner } = useFetchUserById(webData?.userId);
  const [copied, setCopied] = useState(false);
  const { canWrite } = useAuthorization();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      inviteContributers: "",
    },
  });

  const link = useMemo(() => {
    return typeof window !== "undefined"
      ? `${window.location.origin}/web/${webId as string}`
      : `${environment.client_url}/web/${webId as string}`;
  }, [webId]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Link copied!",
        description: "The shareable link has been copied to your clipboard.",
      });
    } catch (err) {
      console.error("Failed to copy", err);
      toast({
        title: "Failed to copy link",
        description: "Could not copy link to clipboard.",
        variant: "destructive",
      });
    }
  }, [link]);

  // Don't render if we don't have webId
  if (!webId || !webData) {
    return null;
  }

  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger asChild>
          <Button
            size="sm"
            className="ml-auto gap-1.5 border dark:bg-violet-400/40 dark:border-violet-200 dark:hover:bg-violet-400/60 text-sm"
          >
            <Forward size={16} /> <span>Share</span>
          </Button>
        </DrawerTrigger>
        <DrawerContent className="px-6 pb-10 h-[85dvh]">
          <DrawerHeader>
            <DrawerTitle>Share this Web</DrawerTitle>
            {canWrite && (
              <DrawerDescription>
                <span className="text-sm text-muted-foreground font-semibold">
                  Manage who can view and contribute
                </span>
              </DrawerDescription>
            )}
          </DrawerHeader>
          <div className="mt-4">
            <ShareForm
              form={form}
              webOwner={webOwner}
              copied={copied}
              handleCopy={handleCopy}
            />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          className="ml-auto gap-1.5 border dark:bg-violet-400/40 dark:border-violet-200 dark:hover:bg-violet-400/60 text-sm"
        >
          <Forward size={16} />{" "}
          <span className="hidden md:inline lg:inline">Share</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        sideOffset={10}
        className="w-[450px] mr-4 p-8 flex flex-col gap-4 rounded-xl shadow-md border bg-background"
      >
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold">Share this Web</h3>
          {canWrite && (
            <p className="text-sm text-muted-foreground font-semibold">
              Manage who can view and contribute
            </p>
          )}
        </div>
        <ShareForm
          form={form}
          webOwner={webOwner}
          copied={copied}
          handleCopy={handleCopy}
        />
      </PopoverContent>
    </Popover>
  );
};

export default SharePopover;
