"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  ChevronsUpDown,
  MonitorCog,
  Moon,
  Sun,
  AlertTriangle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PublicUser } from "@/types/user";
import { useEditUser } from "@/hooks/user";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/router";

const languages = [
  { label: "English", value: "en" },
  { label: "French", value: "fr" },
  { label: "German", value: "de" },
  { label: "Spanish", value: "es" },
  { label: "Portuguese", value: "pt" },
  { label: "Russian", value: "ru" },
  { label: "Japanese", value: "ja" },
  { label: "Korean", value: "ko" },
  { label: "Chinese", value: "zh" },
] as const;

const accountFormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .max(30, {
      message: "Name must not be longer than 30 characters.",
    }),
  language: z.string({
    required_error: "Please select a language.",
  }),
  theme: z.enum(["light", "dark", "system"], {
    required_error: "Please select a theme.",
  }),
  avatar: z.string({
    required_error: "Please select a theme.",
  }),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

export function AccountForm({ user }: { user: PublicUser }) {
  const [mounted, setMounted] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { mutateAsync: editUser, isPending, error } = useEditUser();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { logout } = useUser();
  const [showPricingModal, setShowPricingModal] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/explore");
  };

  const handleDeleteSubscription = async () => {
    try {
      setIsDeleting(true);
      const apiUrl =
        process.env.NEXT_PUBLIC_LOCAL_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/payment/cancel-subscription`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned an invalid response");
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Failed to cancel subscription");
      }

      toast({
        title: "Success",
        description: data.message || "Subscription cancelled successfully",
        variant: "default",
      });

      // Refresh the page to update the user's plan
      router.reload();
    } catch (err: any) {
      console.error("Error cancelling subscription:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to cancel subscription",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpgradeClick = () => {
    if (user?.accountStatus === "free") {
      setShowPricingModal(true);
    }
  };

  const defaultValues: Partial<AccountFormValues> = {
    theme: (theme as "light" | "dark" | "system") || "light",
  };

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues,
  });

  function onSubmit(data: AccountFormValues) {
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && theme) {
      form.setValue("theme", theme as "light" | "dark" | "system");
    }
  }, [theme, mounted, form]);

  if (!mounted || !user) {
    return null;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="theme"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between space-y-0">
              <div className="space-y-0.5">
                <FormLabel>Theme</FormLabel>
                <FormDescription>Select a theme</FormDescription>
              </div>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  setTheme(value);
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue
                      className="w-[120px]"
                      placeholder="Select theme"
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="w-[100px]">
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun size={16} />
                      <span>Light</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon size={16} />
                      <span>Dark</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <MonitorCog size={16} />
                      <span>System</span>
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
          name="language"
          disabled
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between space-y-0">
              <div className="space-y-0.5">
                <FormLabel>Language</FormLabel>
                <FormDescription>
                  This is the language that will be used in app.<br></br>{" "}
                  Multiple languages coming soon!
                </FormDescription>
              </div>
              <Popover>
                <PopoverTrigger disabled asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-[200px] justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? languages.find(
                            (language) => language.value === field.value
                          )?.label
                        : "Select language"}
                      <ChevronsUpDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[100px] p-0">
                  <Command>
                    <CommandInput disabled placeholder="Search language..." />
                    <CommandList>
                      <CommandEmpty>No language found.</CommandEmpty>
                      <CommandGroup>
                        {languages.map((language) => (
                          <CommandItem
                            value={language.label}
                            key={language.value}
                            onSelect={() => {
                              form.setValue("language", language.value);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                language.value === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {language.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="theme"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between space-y-0">
              <div className="space-y-0.5">
                <FormLabel>Active Account</FormLabel>
                <FormDescription>
                  You are logged in as {user.username}
                </FormDescription>
              </div>
              <div className="flex gap-2">
                {user.accountStatus !== "free" && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        Delete Subscription
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                          Cancel Subscription
                        </DialogTitle>
                        <DialogDescription>
                          Are you sure you want to cancel your subscription? You
                          will lose access to premium features at the end of
                          your billing period.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">
                            No, keep my subscription
                          </Button>
                        </DialogClose>
                        <Button
                          variant="destructive"
                          onClick={handleDeleteSubscription}
                          disabled={isDeleting}
                        >
                          {isDeleting
                            ? "Cancelling..."
                            : "Yes, cancel subscription"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
                <Button onClick={handleLogout}>Sign Out</Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium">Account Status</h2>
            <p className="text-sm text-muted-foreground">
              {user?.accountStatus === "pro"
                ? "You're on the Pro plan with unlimited access"
                : user?.accountStatus === "beta"
                  ? "You're on the Beta plan with unlimited access"
                  : user?.accountStatus === "trial"
                    ? "You're on a trial period"
                    : "You're on the Free plan with limited access"}
            </p>
          </div>
          {user?.accountStatus === "free" && (
            <Button
              onClick={handleUpgradeClick}
              className="bg-gradient-to-r from-violet-500 to-violet-600 text-white hover:from-violet-600 hover:to-violet-700"
            >
              Upgrade Plan
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
