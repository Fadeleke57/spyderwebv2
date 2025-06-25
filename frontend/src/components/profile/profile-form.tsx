"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { Pencil, X, Check, Edit } from "lucide-react";
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
import { useEditUser, useUploadProfileImage } from "@/hooks/user";
import UserAvatar from "../utility/UserAvatar";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "../ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import Image from "next/image";
import { useUser } from "@/context/UserContext";

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
      message:
        "Display name can only contain letters, numbers, and underscores.",
    }),
  email: z
    .string({
      required_error: "Please select an email to display.",
    })
    .email(),
  fullname: z.string().min(2).max(20).optional(),
  bio: z.string().max(160).min(4).optional(),
  avatar: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfileForm({ refetch }: { refetch: () => void }) {
  const { user } = useUser();
  const { mutateAsync: editUser, isPending, error } = useEditUser();
  const isMobile = useIsMobile();
  const [isEditingDisplayName, setIsEditingDisplayName] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [stagedImage, setStagedImage] = useState<File | null>(null);
  const [_, setProfileImage] = useState<null | string>(null);
  const { mutateAsync: uploadProfileImage } = useUploadProfileImage();
  const [profileImageModalOpen, setProfileImageModalOpen] = useState(false);

  const defaultValues: Partial<ProfileFormValues> = {
    username: user?.username || "",
    email: user?.email || "",
    bio: user?.bio || "",
    fullname: user?.full_name || "",
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
  });

  const handleEditDisplayName = async () => {
    const isValid = await form.trigger("fullname");
    if (!isValid) return;

    const newFullName = form.getValues("fullname");
    try {
      await editUser({ full_name: newFullName });
      refetch();
      setIsEditingDisplayName(false);
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
      refetch();
      setIsEditingBio(false);
    } catch (error: any) {
      toast({
        title: "Error updating bio",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = (field: "fullname" | "bio") => {
    if (field === "fullname") {
      form.setValue("fullname", user?.username || "");
      setIsEditingDisplayName(false);
    } else {
      form.setValue("bio", user?.bio || "");
      setIsEditingBio(false);
    }
  };

  useEffect(() => {
    if (user) {
      form.setValue("username", user.username || "");
      form.setValue("bio", user.bio || "");
      form.setValue("email", user.email || "");
      form.setValue("fullname", user.full_name || "");
    }
  }, [user, form]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setStagedImage(file);
      setProfileImageModalOpen(true);
    }
  };

  const handleCancelImageUpload = () => {
    setStagedImage(null);
    setProfileImage(null);
    setProfileImageModalOpen(false);
  };

  const handleUploadProfileImage = async () => {
    if (!stagedImage) return;
    try {
      const url = await uploadProfileImage(stagedImage);
      setProfileImage(url);
      toast({
        title: "Avatar updated",
        description: "Avatar updated successfully",
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Error updating avatar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-8 pb-10">
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
              <div>
                <div className="relative">
                  <label className="absolute top-[60%] lg:top-[70%] right-[70%] lg:right-[70%] cursor-pointer">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg,image/heic"
                      className="sr-only"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        handleFileChange(e);
                      }}
                    />
                    <div className="flex items-center justify-center dark:bg-black/70 dark:hover:bg-black/50 rounded-full p-2 lg:px-4 text-xs">
                      <span className="hidden lg:block">Edit</span>
                      <Edit className="lg:ml-2" size={16} />
                    </div>
                  </label>
                  <UserAvatar
                    deactive
                    showTooltip={false}
                    userId={user?.id || ""}
                    dimension={isMobile ? 60 : 100}
                  />
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="fullname"
          render={({ field }) => (
            <FormItem className="w-full px-4">
              <div className="flex items-center justify-between">
                <FormLabel>Display Name</FormLabel>
                {!isEditingDisplayName && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingDisplayName(true)}
                  >
                    Change
                    <Pencil className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <FormControl>
                  <Input
                    className="w-full"
                    disabled={!isEditingDisplayName}
                    {...field}
                  />
                </FormControl>
                {isEditingDisplayName && (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleEditDisplayName}
                      disabled={isPending}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelEdit("fullname")}
                      disabled={isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              <FormDescription>
                Your display name. Other users will see this when they search
                for you.
              </FormDescription>
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
              </div>
              <div className="flex gap-2">
                <FormControl>
                  <Input
                    className="w-full focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0 transition-none"
                    readOnly
                    {...field}
                  />
                </FormControl>
              </div>
              <FormDescription>Your username cannot be changed yet.</FormDescription>
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
                  className="w- focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0 transition-none"
                  placeholder="Enter your email..."
                  value={form.watch("email")}
                  readOnly
                />
              </FormControl>
              <FormDescription>Your email cannot be changed yet.</FormDescription>
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
                    Change
                    <Pencil className="h-4 w-4 ml-2" />
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
                A brief description about yourself
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
      {stagedImage && (
        <ProfilePictureStageModal
          open={profileImageModalOpen}
          setOpen={setProfileImageModalOpen}
          image={stagedImage}
          handleConfirm={handleUploadProfileImage}
          handleCancel={handleCancelImageUpload}
        />
      )}
    </Form>
  );
}

function ProfilePictureStageModal({
  open,
  setOpen,
  image,
  handleConfirm,
  handleCancel,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  image: File | null;
  handleConfirm: () => void;
  handleCancel: () => void;
}) {
  const handleAcceptImage = () => {
    handleConfirm && handleConfirm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-10 max-h-[90dvh]">
        <DialogHeader>
          <DialogTitle>Profile Picture</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Are you sure you want to update your profile picture?
        </DialogDescription>
        {image && (
          <Image
            src={URL.createObjectURL(image)}
            alt="Staged Image"
            width={200}
            height={200}
            className="rounded-md border"
          ></Image>
        )}
        <DialogFooter className="flex flex-col gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleAcceptImage}>Update</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
