"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, MonitorCog, Moon, Sun } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
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
  const { mutateAsync: editUser, isPending, error } = useEditUser();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { logout } = useUser();

  const handleLogout = async () => {
    await logout();
    router.push("/explore");
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
                  This is the language that will be used in app
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
              <Button onClick={handleLogout}>Sign Out</Button>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
