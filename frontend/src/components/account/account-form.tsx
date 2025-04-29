"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MonitorCog, Moon, Sun, AlertTriangle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

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
  Form,
  FormControl,
  FormDescription,
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
import { PublicUser } from "@/types/user";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/router";
import { PricingModal } from "../pricing/PricingModal";

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
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { logout } = useUser();
  const [showPricingModal, setShowPricingModal] = useState(false);
  console.log(user);
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
    console.log("user plan", user?.subscription_plan);
    if (user?.subscription_plan === "free") {
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
                <Button onClick={handleLogout}>Sign Out</Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium mb-1">Account Status</h2>
            <p className="text-sm text-muted-foreground">
              You are on the{" "}
              <span className="text-violet-400/80">
                {user.subscription_plan[0].toUpperCase() +
                  user.subscription_plan.slice(1)}
              </span>{" "}
              plan
            </p>
          </div>
          {user?.subscription_plan && (
            <div className="flex flex-row gap-2">
              {user.subscription_plan !== "free" && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Cancel Subscription</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Cancel Subscription
                      </DialogTitle>
                      <DialogDescription>
                        Are you sure you want to cancel your subscription? You
                        will lose access to premium features at the end of your
                        billing period.
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
              {user.subscription_plan === "free" && (
                <Button onClick={handleUpgradeClick} variant={"secondary"}>
                  Upgrade Plan
                </Button>
              )}
            </div>
          )}
        </div>
      </form>
      <PricingModal open={showPricingModal} setOpen={setShowPricingModal} />
    </Form>
  );
}
