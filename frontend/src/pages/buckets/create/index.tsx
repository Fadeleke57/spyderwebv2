import {
  Bird,
  CornerDownLeft,
  Globe,
  Link,
  Lock,
  Mic,
  Paperclip,
  Pencil,
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
import { useCreateBucket } from "@/hooks/buckets"; // Import the hook
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
import { useRouter } from "next/router";
import withAuth from "@/hoc/withAuth";
export const description =
  "An AI playground with a sidebar navigation and a main content area. The playground has a header with a settings drawer and a share button. The sidebar has navigation links and a user menu. The main content area shows a form to configure the model and messages.";

const bucketSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().min(0, { message: "Description is required" }),
  visibility: z.enum(["private", "public", "invite"]).default("private"),
});
import { useEffect, useState } from "react";
import { formatText } from "@/lib/utils";

type BucketFormValues = z.infer<typeof bucketSchema>;

type BucketConfig = {
  name: string;
  description: string;
  visibility: "private" | "public" | "invite";
};

function Bucket() {
  const router = useRouter();
  const { toast } = useToast();
  const { createBucket, loading } = useCreateBucket();
  const [bucketConfig, setBucketConfig] = useState<BucketConfig>({
    name: "Untitled",
    description: "",
    visibility: "private",
  });
  const form = useForm<BucketFormValues>({
    resolver: zodResolver(bucketSchema),
  });

  const onSubmit: SubmitHandler<BucketFormValues> = async (data) => {
    try {
      await createBucket({
        name: bucketConfig.name,
        description: bucketConfig.description,
        private: bucketConfig.visibility === "private",
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

  const onTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value === "") {
      setBucketConfig({
        ...bucketConfig,
        name: "Untitled",
      });
      return;
    }
    setBucketConfig({
      ...bucketConfig,
      name: event.target.value,
    });
  };

  const onDescriptionChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setBucketConfig({
      ...bucketConfig,
      description: event.target.value,
    });
  };

  return (
    <div className="grid h-screen w-full">
      <div className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4">
          <h1 className="text-xl font-semibold text-slate-500">
            {formatText(bucketConfig.name, 100)}
          </h1>
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Pencil className="size-4" />
                <span className="sr-only">Settings</span>
              </Button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[80vh]">
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid w-full items-start gap-6"
              >
                <fieldset className="grid gap-6 rounded-lg py-8 px-4">
                  <div>
                    <div className="flex flex-col space-y-2">
                      <Textarea
                        id="name"
                        rows={1}
                        placeholder="Give it a title..."
                        {...form.register("name")}
                        className="w-full min-h-[2rem] bg-transparent p-0 text-3xl font-bold leading-tight resize-none focus:outline-none border-none bg-none p-0 ring-offset-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none m-0 py-0 text-2xl font-semibold"
                        onInput={(e: any) => {
                          e.target.style.height = "auto";
                          e.target.style.height = `${e.target.scrollHeight}px`;
                          form.trigger("name");
                        }}
                        onChange={(e: any) => onTitleChange(e)}
                      />
                      <Textarea
                        id="description"
                        rows={1}
                        placeholder="Enter a brief description of your bucket..."
                        {...form.register("description")}
                        className="w-full min-h-[1px] bg-transparent p-0 text-lg leading-relaxed resize-none focus:outline-none border-none bg-none p-0 ring-offset-none focus-visible:ring-0 focus-visible:ring-offset-0 text-lg font-normal resize-none text-sm text-muted-foreground"
                        onInput={(e: any) => {
                          e.target.style.height = "auto";
                          e.target.style.height = `${e.target.scrollHeight}px`;
                        }}
                        onChange={(e: any) => onDescriptionChange(e)}
                      />
                    </div>
                  </div>
                  <div>
                    <small className="text-red-500">
                      {form.formState.errors.description?.message}
                    </small>
                  </div>
                  <Button
                    disabled={loading}
                    type="submit"
                    className="w-[100px]"
                  >
                    {loading ? "Saving..." : "Save Draft"}
                  </Button>
                </fieldset>
              </form>
            </DrawerContent>
          </Drawer>
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
              <fieldset className="grid gap-6 rounded-lg py-8 px-4">
                <div>
                  <div className="flex flex-col space-y-2">
                    <Textarea
                      id="name"
                      rows={1}
                      placeholder="Give it a title..."
                      {...form.register("name")}
                      className="w-full min-h-[2rem] bg-transparent p-0 text-3xl font-bold leading-tight resize-none focus:outline-none border-none bg-none p-0 ring-offset-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none m-0 py-0 text-2xl font-semibold"
                      onInput={(e: any) => {
                        e.target.style.height = "auto";
                        e.target.style.height = `${e.target.scrollHeight}px`;
                        form.trigger("name");
                      }}
                      onChange={(e: any) => onTitleChange(e)}
                    />
                    <Textarea
                      id="description"
                      rows={1}
                      placeholder="Enter a brief description of your bucket..."
                      {...form.register("description")}
                      className="w-full min-h-[1px] bg-transparent p-0 text-lg leading-relaxed resize-none focus:outline-none border-none bg-none p-0 ring-offset-none focus-visible:ring-0 focus-visible:ring-offset-0 text-lg font-normal resize-none text-sm text-muted-foreground"
                      onInput={(e: any) => {
                        e.target.style.height = "auto";
                        e.target.style.height = `${e.target.scrollHeight}px`;
                      }}
                      onChange={(e: any) => onDescriptionChange(e)}
                    />
                  </div>
                </div>
                <div>
                  <small className="text-red-500">
                    {form.formState.errors.description?.message}
                  </small>
                </div>
                <Button disabled={loading} type="submit" className="w-[100px]">
                  {loading ? "Saving..." : "Save Draft"}
                </Button>
              </fieldset>
            </form>
          </ScrollArea>
          <div className="relative flex h-full min-h-[50vh] flex-col rounded-xl bg-muted/50 p-4 lg:col-span-2">
            <Badge variant="outline" className="absolute right-3 top-3">
              Bucket
            </Badge>
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

export default withAuth(Bucket);
