"use client";

import React, { useEffect, useState } from "react";
import {
  Check,
  Copy,
  Ellipsis,
  Forward,
  Link2,
  Lock,
  Send,
  Trash2,
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRouter } from "next/router";
import { environment } from "@/environment/load_env";
import UserAvatar from "./UserAvatar";
import { useUser } from "@/context/UserContext";
import { useFetchWebById, useInviteContributer } from "@/hooks/webs";
import { useFetchUserById } from "@/hooks/user";
import { Web } from "@/types/web";

const exampleContributers = [
  {
    userId: "fadel@spyderweb.com",
    username: "fadel",
    profilepicurl: "https://robohash.org/fadel",
    role: "Owner",
  },
];

const FormSchema = z.object({
  viewAccess: z.enum(["private", "anyone"], {
    required_error: "Please select a view access option.",
  }),
  inviteContributers: z.string().email("Please enter a valid email").optional(),
});

const ShareForm = ({
  form,
  webOwner,
  isOwner,
  copied,
  handleCopy,
  onSubmit,
}: any) => {
  const router = useRouter();
  const { webId } = router.query;
  const { mutateAsync: inviteContributer } = useInviteContributer();

  const handleInviteUser = () => {
    if (form.formState.errors.inviteContributers) return;
    try {
      inviteContributer({
        webId: webId as string,
        emailToInvite: form.getValues("inviteContributers"),
      });
    } catch (error) {
      console.error("Failed to invite user", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="viewAccess"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-muted-foreground">
                View Access
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={!isOwner}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select view access" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="p-2">
                  <SelectItem
                    className={`p-2 cursor-pointer rounded-md ${
                      field.value === "private" ? "text-violet-400" : ""
                    }`}
                    value="private"
                  >
                    <div className="flex items-center gap-2">
                      <Lock size={14} />
                      Only Invited Members
                    </div>
                  </SelectItem>
                  <SelectItem
                    className={`p-2 cursor-pointer rounded-md ${
                      field.value === "anyone" ? "text-violet-400" : ""
                    }`}
                    value="anyone"
                  >
                    <div className="flex items-center gap-2">
                      <Link2 size={16} />
                      Anyone with the link
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="inviteContributers"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-muted-foreground">
                Invite Contributers
              </FormLabel>
              <p className="text-xs text-red-400">
                {form.formState.errors.inviteContributers?.message}
              </p>
              <div
                tabIndex={0}
                className="flex items-center gap-2 border rounded-md"
              >
                <Input
                  className="autofill:border-none autofill:bg-transparent border-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0 transition-none py-1 flex-1"
                  placeholder="Email"
                  {...field}
                />
                <Button
                  size="icon"
                  className="hover:opacity-80 dark:bg-transparent dark:hover:bg-transparent"
                  onClick={handleInviteUser}
                >
                  <Send size={14} />
                </Button>
              </div>
            </FormItem>
          )}
        />

        <div>
          <p className="text-xs text-muted-foreground mb-2">
            People with access
          </p>
          <div className="flex flex-col max-h-[120px] overflow-y-auto gap-2 no-scrollbar">
            <div className="flex w-full items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <UserAvatar dimension={30} userId={webOwner?.id} />
                <p className="text-sm">{webOwner?.username}</p>
              </div>
              <span className="text-xs text-muted-foreground">Owner</span>
            </div>
            {exampleContributers.map((contributor, index) => (
              <div
                key={index}
                className="flex w-full items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <UserAvatar dimension={30} userId={contributor.userId} />
                  <p className="text-sm">{contributor.username}</p>
                </div>
                <Popover>
                  <PopoverTrigger className="flex text-muted-foreground items-center gap-2">
                    <span className="text-xs">{contributor.role}</span>
                    <Ellipsis size={16} />
                  </PopoverTrigger>
                  <PopoverContent className="w-fit p-0 mr-10">
                    <Button variant="ghost" className="flex items-center gap-2">
                      <Trash2 size={14} />
                      Remove Access
                    </Button>
                  </PopoverContent>
                </Popover>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <Button
            type="button"
            variant="outline"
            className="justify-center gap-2 text-sm"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check size={14} />
                Copied!
              </>
            ) : (
              <>
                <Copy size={14} />
                Copy Link
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
  const { user } = useUser();
  const { webId } = router.query;
  const { data: webData } = useFetchWebById(webId as string);
  const { data: webOwner } = useFetchUserById(webData?.userId);
  const [copied, setCopied] = useState(false);
  const [web, setWeb] = useState<Web | null>(null);
  const isOwner = webOwner && user && webOwner.id === user.id;

  useEffect(() => {
    if (webData) setWeb(webData);
  }, [webData]);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      viewAccess: "anyone",
      inviteContributers: "",
    },
  });

  const link =
    typeof window !== "undefined"
      ? `${window.location.origin}/web/${webId as string}`
      : `${environment.client_url}/web/${webId as string}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
      toast("Failed to copy link to clipboard");
    }
  };

  function onSubmit(data: z.infer<typeof FormSchema>) {
    toast("Share settings updated", {
      description: (
        <pre className="mt-2 w-[320px] rounded-md bg-neutral-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger asChild>
          <Button
            size="sm"
            className="ml-auto gap-1.5 border dark:bg-violet-400/40 dark:border-violet-200 dark:hover:bg-violet-400/60 text-sm"
          >
            <Forward size={16} />
            <span>Share</span>
          </Button>
        </DrawerTrigger>
        <DrawerContent className="px-6 pb-10 h-[85dvh]">
          <DrawerHeader>
            <DrawerTitle>Share this Web</DrawerTitle>
            <DrawerDescription>
              Manage who can view and contribute
            </DrawerDescription>
          </DrawerHeader>
          <div className="mt-4">
            <ShareForm
              form={form}
              webOwner={webOwner}
              isOwner={isOwner}
              copied={copied}
              handleCopy={handleCopy}
              onSubmit={onSubmit}
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
          <Forward size={16} />
          <span className="hidden md:inline lg:inline">Share</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        sideOffset={10}
        className="w-[450px] mr-4 p-8 flex flex-col gap-4 rounded-xl shadow-md border bg-background"
      >
        <h3 className="text-lg font-semibold mb-1">Share this Web</h3>
        <p className="text-sm text-muted-foreground">
          Manage who can view and contribute
        </p>
        <ShareForm
          form={form}
          webOwner={webOwner}
          isOwner={isOwner}
          copied={copied}
          handleCopy={handleCopy}
          onSubmit={onSubmit}
        />
      </PopoverContent>
    </Popover>
  );
};

export default SharePopover;
