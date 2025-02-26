"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { Pencil, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PublicUser } from "@/types/user";
import { useEditUser } from "@/hooks/user";
import UserAvatar from "../utility/UserAvatar";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "../ui/use-toast";

const profileFormSchema = z.object({
  username: z
    .string()
    .min(6, {
      message: "Username must be at least 6 characters.",
    })
    .max(20, {
      message: "Username must not be longer than 20 characters.",
    })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username can only contain letters, numbers, and underscores.",
    }),
  email: z
    .string({
      required_error: "Please select an email to display.",
    })
    .email(),
  bio: z.string().max(160).min(4).optional(),
  avatar: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfileForm({
  user,
  refetch,
}: {
  user: PublicUser;
  refetch: () => void;
}) {
  const { mutateAsync: editUser, isPending, error } = useEditUser();
  const isMobile = useIsMobile();
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);

  const defaultValues: Partial<ProfileFormValues> = {
    username: user?.username || "",
    email: user?.email || "",
    bio: user?.bio || "",
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
  });

  const handleEditUsername = async () => {
    const isValid = await form.trigger("username");
    if (!isValid) return;

    const newUsername = form.getValues("username");
    try {
      await editUser({ username: newUsername });
      await refetch();
      setIsEditingUsername(false);
    } catch (error: any) {
      toast({
        title: "Error updating username",
        description:
          error.response.status === 400
            ? "Username already exists"
            : error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditBio = async () => {
    const isValid = await form.trigger("bio");
    if (!isValid) return;

    const newBio = form.getValues("bio");
    try {
      await editUser({ bio: newBio });
      await refetch();
      setIsEditingBio(false);
    } catch (error: any) {
      toast({
        title: "Error updating bio",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = (field: "username" | "bio") => {
    if (field === "username") {
      form.setValue("username", user?.username || "");
      setIsEditingUsername(false);
    } else {
      form.setValue("bio", user?.bio || "");
      setIsEditingBio(false);
    }
  };

  useEffect(() => {
    if (user?.username) {
      form.setValue("username", user.username);
    }
    if (user?.bio) {
      form.setValue("bio", user.bio);
    }
  }, [user?.username, user?.bio, form]);

  return (
    <Form {...form}>
      <form className="space-y-8">
        <FormField
          control={form.control}
          name="avatar"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between space-y-0 bg-muted rounded-md p-4">
              <div className="space-y-0.5">
                <FormLabel>Avatar</FormLabel>
                <FormDescription>
                  Feel free to change your avatar.
                </FormDescription>
              </div>
              <FormControl>
                <UserAvatar
                  userId={user?.id || ""}
                  className="w-[60px] h-[60px] lg:w-[100px] lg:h-[100px]"
                  width={isMobile ? 60 : 100}
                  height={isMobile ? 60 : 100}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem className="w-full px-4">
              <div className="flex items-center justify-between">
                <FormLabel>Username</FormLabel>
                {!isEditingUsername && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingUsername(true)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <FormControl>
                  <Input
                    className="w-full"
                    disabled={!isEditingUsername}
                    {...field}
                  />
                </FormControl>
                {isEditingUsername && (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleEditUsername}
                      disabled={isPending}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelEdit("username")}
                      disabled={isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              <FormDescription>
                This is your public display name. Other users will see this when
                they search for you.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="w-full px-4">
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  disabled
                  className="w-full"
                  placeholder="shadcn"
                  {...field}
                />
              </FormControl>
              <FormDescription>This is your email</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem className="px-4">
              <div className="flex items-center justify-between">
                <FormLabel>Bio</FormLabel>
                {!isEditingBio && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingBio(true)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <FormControl>
                  <Textarea
                    placeholder="Tell us a little bit about yourself"
                    className="resize-none"
                    disabled={!isEditingBio}
                    {...field}
                  />
                </FormControl>
                {isEditingBio && (
                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleEditBio}
                      disabled={isPending}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelEdit("bio")}
                      disabled={isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              <FormDescription>
                Give a brief description of yourself
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
