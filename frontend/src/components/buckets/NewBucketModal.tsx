import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { useCreateBucket } from "@/hooks/buckets";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/router";
import { useState } from "react";
import { Textarea } from "../ui/textarea";
import { set } from "lodash";
const bucketSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().min(0, { message: "Description is required" }),
  visibility: z.enum(["private", "public", "invite"]).default("private"),
});

type BucketFormValues = z.infer<typeof bucketSchema>;

type BucketConfig = {
  name: string;
  description: string;
  visibility: "private" | "public" | "invite";
};

export function NewBucketModal({children}: {children: React.ReactNode}) {
  //make the button more flexible
  const router = useRouter();
  const { toast } = useToast();
  const { createBucket, loading } = useCreateBucket();
  const { user } = useUser();
  const [bucketConfig, setBucketConfig] = useState<BucketConfig>({
    name: "Untitled",
    description: "",
    visibility: "private",
  });
  const form = useForm<BucketFormValues>({
    resolver: zodResolver(bucketSchema),
  });
  const [open, setOpen] = useState(false);

  const onSubmit: SubmitHandler<BucketFormValues> = async (data) => {
    try {
      if (!user) {
        router.push("/auth/login");
        return;
      }
      const bucketId = await createBucket({
        name: bucketConfig.name,
        description: bucketConfig.description,
        private: bucketConfig.visibility === "private",
        tags: [], // add selected tags here, if applicable
        articleIds: [], // empty list for now
        imageKeys: [], // empty list for now
      });
      form.reset(); // reset the form after successful submission
      setOpen(false);
      router.push("/buckets/bucket/" + bucketId);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-[350px] px-8 rounded-md lg:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-left">
            What would you like to start thinking about?
          </DialogTitle>
          <DialogDescription className="text-left">
            Create a second brain.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid w-full items-start gap-6"
        >
          <fieldset className="grid gap-6 rounded-lg py-8">
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
                  maxLength={200}
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
          </fieldset>
          <DialogFooter>
            <Button disabled={loading} type="submit" className="w-[100px]">
              {loading ? "Saving..." : "Save Draft"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
