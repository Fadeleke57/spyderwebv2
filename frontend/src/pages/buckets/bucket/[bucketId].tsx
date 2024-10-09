import React from "react";
import { useRouter } from "next/router";
import { useFetchBucketById } from "@/hooks/buckets";
import {
  Bird,
  CornerDownLeft,
  Globe,
  Link,
  Lock,
  Mic,
  Paperclip,
  Rabbit,
  Settings,
  Share,
  Turtle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { useUpdateBucket } from "@/hooks/buckets"; // Import the hook
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TagsPopover } from "@/components/home/TagsPopover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatText } from "@/lib/utils";
import { useUser } from "@/context/UserContext";
export const description =
  "An AI playground with a sidebar navigation and a main content area. The playground has a header with a settings drawer and a share button. The sidebar has navigation links and a user menu. The main content area shows a form to configure the model and messages.";

const bucketSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  visibility: z.enum(["private", "public", "invite"], {
    required_error: "Visibility is required",
  }),
});
type BucketFormValues = z.infer<typeof bucketSchema>;

function Index() {
  const { toast } = useToast();
  const router = useRouter();
  const { bucketId } = router.query;
  const { bucket, loading, error } = useFetchBucketById(bucketId as string);
  const { updateBucket } = useUpdateBucket(bucketId as string);
  const { user } = useUser();
  const isOwner = bucket?.userId === user?.id;

  const form = useForm<BucketFormValues>({
    resolver: zodResolver(bucketSchema),
  });

  const onSubmit: SubmitHandler<BucketFormValues> = async (data) => {
    try {
      await updateBucket({
        name: data.name,
        description: data.description,
        private: data.visibility === "private",
        tags: [], // add selected tags here, if applicable
        articleIds: [], // empty list for now
        imageKeys: [], // empty list for now
      });
      toast({ title: "Bucket created successfully!" });
      form.reset(); // reset the form after successful submission
      router.push("/buckets");
    } catch (error: any) {
      toast({
        title: "Error creating bucket",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return loading ? (
    <div>Loading...</div>
  ) : (
    <div className="grid h-screen w-full">
      <div className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4">
          <h1 className="text-xl font-semibold text-blue-500">
            {bucket?.name && formatText(bucket.name, 90)}
          </h1>
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Settings className="size-4" />
                <span className="sr-only">Settings</span>
              </Button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[80vh]">
              <DrawerHeader>
                <DrawerTitle>Configuration</DrawerTitle>
                <DrawerDescription>
                  Configure the settings for the model and messages.
                </DrawerDescription>
              </DrawerHeader>
              <form className="grid w-full items-start gap-6 overflow-auto p-4 pt-0">
                <fieldset className="grid gap-6 rounded-lg border p-4">
                  <legend className="-ml-1 px-1 text-sm font-medium">
                    Settings
                  </legend>
                  <div className="grid gap-3">
                    <Label htmlFor="model">Model</Label>
                    <Select>
                      <SelectTrigger
                        id="model"
                        className="items-start [&_[data-description]]:hidden"
                      >
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="genesis">
                          <div className="flex items-start gap-3 text-muted-foreground">
                            <Rabbit className="size-5" />
                            <div className="grid gap-0.5">
                              <p>
                                Neural{" "}
                                <span className="font-medium text-foreground">
                                  Genesis
                                </span>
                              </p>
                              <p className="text-xs" data-description>
                                Our fastest model for general use cases.
                              </p>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="explorer">
                          <div className="flex items-start gap-3 text-muted-foreground">
                            <Bird className="size-5" />
                            <div className="grid gap-0.5">
                              <p>
                                Neural{" "}
                                <span className="font-medium text-foreground">
                                  Explorer
                                </span>
                              </p>
                              <p className="text-xs" data-description>
                                Performance and speed for efficiency.
                              </p>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="quantum">
                          <div className="flex items-start gap-3 text-muted-foreground">
                            <Turtle className="size-5" />
                            <div className="grid gap-0.5">
                              <p>
                                Neural{" "}
                                <span className="font-medium text-foreground">
                                  Quantum
                                </span>
                              </p>
                              <p className="text-xs" data-description>
                                The most powerful model for complex
                                computations.
                              </p>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="temperature">Temperature</Label>
                    <Input id="temperature" type="number" placeholder="0.4" />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="top-p">Top P</Label>
                    <Input id="top-p" type="number" placeholder="0.7" />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="top-k">Top K</Label>
                    <Input id="top-k" type="number" placeholder="0.0" />
                  </div>
                </fieldset>
                <fieldset className="grid gap-6 rounded-lg border p-4">
                  <legend className="-ml-1 px-1 text-sm font-medium">
                    Messages
                  </legend>
                  <div className="grid gap-3">
                    <Label htmlFor="role">Role</Label>
                    <Select defaultValue="system">
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="system">System</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="assistant">Assistant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="content">Content</Label>
                    <Textarea id="content" placeholder="You are a..." />
                  </div>
                </fieldset>
              </form>
            </DrawerContent>
          </Drawer>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto gap-1.5 text-sm"
          >
            <Share className="size-3.5" />
            Share
          </Button>
        </header>
        <main className="grid flex-1 gap-4 overflow-auto p-4 md:grid-cols-2 lg:grid-cols-3">
          <ScrollArea
            className="relative h-[calc(90vh-18px)] hidden flex-col items-start gap-8 md:flex"
            x-chunk="dashboard-03-chunk-0"
          >
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid w-full items-start gap-6"
            >
              <fieldset className="grid gap-2 rounded-lg border p-4">
                <legend className="-ml-1 px-1 text-sm font-medium">
                  Information
                </legend>
                <div className="grid gap-3">
                  <div className="grid gap-3">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      type="text"
                      defaultValue={bucket?.name}
                      placeholder="i.e. Elon Musk's Twitter Scandals"
                      {...form.register("name")}
                      disabled={!isOwner}
                    />
                    <small className="text-red-500">
                      {form.formState.errors.name?.message}
                    </small>
                  </div>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="This bucket contains a map of all of Elon's twitter slip ups.."
                    className="min-h-[9.5rem]"
                    defaultValue={bucket?.description}
                    {...form.register("description")}
                    disabled={!isOwner}
                  />
                  <small className="text-red-500">
                    {form.formState.errors.description?.message}
                  </small>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <TagsPopover />
                </div>
              </fieldset>
              <fieldset className="grid gap-6 rounded-lg border p-4">
                <legend className="-ml-1 px-1 text-sm font-medium">
                  Settings
                </legend>
                <div className="grid gap-3">
                  <Label htmlFor="visibility">Privacy</Label>
                  <Select
                    onValueChange={(value) =>
                      form.setValue(
                        "visibility",
                        value as "private" | "public" | "invite"
                      )
                    }
                    defaultValue={bucket?.visibility}
                  >
                    <SelectTrigger id="visibility">
                      <SelectValue
                        defaultValue={bucket?.visibility}
                        placeholder="Select visibility"
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="invite">Invite-Only</SelectItem>
                    </SelectContent>
                  </Select>
                  <small className="text-red-500">
                    {form.formState.errors.visibility?.message}
                  </small>
                </div>
              </fieldset>
              <Button disabled={loading} type="submit">
                {loading ? "Updating..." : "Update"}
              </Button>
            </form>
          </ScrollArea>
          <div className="relative flex h-full min-h-[50vh] flex-col rounded-xl bg-muted/50 p-4 lg:col-span-2">
            <Badge variant="outline" className="absolute right-3 top-3">
              Bucket
            </Badge>
            {bucket?.articleIds.length === 0 && (
              <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/4 flex flex-col items-center gap-1 text-center">
                <h3 className="text-2xl font-bold tracking-tight">
                  {user ? "Iterate" : "Sign in to iterate on this bucket"}
                </h3>
                {user && (
                  <p className="text-sm text-muted-foreground">
                    Start collecting data to add your bucket here.
                  </p>
                )}
                <Button
                  className="mt-4"
                  onClick={() => router.push(`${user ? "/terminal" : "/auth/login"}`)}
                >
                  {user ? "Open Terminal" : "Login"}
                </Button>
              </div>
            )}
            <div className="flex-1" />
            <form
              className="relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring"
              x-chunk="dashboard-03-chunk-1"
            >
              <Label htmlFor="notes" className="sr-only">
                Notes
              </Label>
              <Textarea
                id="notes"
                placeholder="Type your notes here..."
                className="min-h-12 resize-none border-0 p-3 shadow-none focus-visible:ring-0"
              />
              <div className="flex items-center p-3 pt-0">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Paperclip className="size-4" />
                        <span className="sr-only">Attach file</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Attach File</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Mic className="size-4" />
                        <span className="sr-only">Use Microphone</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Use Microphone</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Button type="submit" size="sm" className="ml-auto gap-1.5">
                  Add Note
                  <CornerDownLeft className="size-3.5" />
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Index;
