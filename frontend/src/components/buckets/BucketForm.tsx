import React, { useEffect, useState, useCallback } from "react";
import { Bucket } from "@/types/bucket";
import { PublicUser } from "@/types/user";
import { useUpdateBucket } from "@/hooks/buckets";
import { useToast } from "../ui/use-toast";
import { useRouter } from "next/router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Textarea } from "../ui/textarea";
import BucketChart from "./BucketChart";
import { debounce } from "lodash";

type FormProps = {
  bucket: Bucket;
  user: PublicUser | null;
};

const bucketSchema = z.object({
  name: z.string().min(1, { message: "Claim is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  visibility: z.enum(["private", "public", "invite"], {}).default("private"),
});

type BucketFormValues = z.infer<typeof bucketSchema>;

type BucketConfig = {
  name: string;
  description: string;
  visibility: "private" | "public" | "invite";
};

function BucketForm({ bucket, user }: FormProps) {
  const isOwner = user?.id === bucket?.userId;
  const { updateBucket, loading } = useUpdateBucket(bucket?.bucketId);
  const { toast } = useToast();
  const router = useRouter();

  const [bucketConfig, setBucketConfig] = useState<BucketConfig>({
    name: bucket.name,
    description: bucket.description,
    visibility: bucket.private ? "private" : "public",
  });

  const form = useForm<BucketFormValues>({
    resolver: zodResolver(bucketSchema),
  });

  // debounce the submit function to reduce frequency of autosaves
  const debouncedSave = useCallback(
    debounce(async (config) => {
      try {
        await updateBucket({
          name: config.name,
          description: config.description,
          private: config.visibility === "private",
        });
        toast({ title: "Changes saved automatically." });
      } catch (error: any) {
        toast({
          title: "Error updating bucket",
          description: error.message,
          variant: "destructive",
        });
      }
    }, 1000),
    []
  );

  const onConfigChange = (newConfig: BucketConfig) => {
    setBucketConfig(newConfig);
    debouncedSave(newConfig); // Autosave with debounced function
  };

  const onTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onConfigChange({
      ...bucketConfig,
      name: event.target.value || "Untitled",
    });
  };

  const onDescriptionChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    onConfigChange({
      ...bucketConfig,
      description: event.target.value,
    });
  };

  return (
    <form className="grid w-full items-start gap-6">
      <div className="grid gap-4 rounded-lg pb-8 pt-4 px-4">
        <div>
          <div className="flex flex-col space-y-2">
            <small className="text-sm font-medium leading-none text-blue-500">
              {bucket?.private ? "Private" : "Public"}
            </small>
            <Textarea
              id="name"
              placeholder="Give it a title..."
              rows={1}
              defaultValue={bucket?.name || "Untitled"}
              {...form.register("name")}
              className="w-full min-h-[2rem] bg-transparent p-0 text-3xl font-bold leading-tight resize-none focus:outline-none border-none bg-none p-0 ring-offset-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none m-0 py-0 text-2xl font-semibold"
              onInput={(e: any) => {
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
                form.trigger("name");
              }}
              onChange={(e : any) => onTitleChange(e)}
            />
            <Textarea
              id="description"
              placeholder="Add a description..."
              rows={1}
              defaultValue={bucket?.description || ""}
              {...form.register("description")}
              className="w-full min-h-[1px] bg-transparent p-0 text-lg leading-relaxed resize-none focus:outline-none border-none bg-none p-0 ring-offset-none focus-visible:ring-0 focus-visible:ring-offset-0 text-lg font-normal resize-none text-sm text-muted-foreground"
              onInput={(e: any) => {
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              onChange={(e : any) => onDescriptionChange(e)}
            />
          </div>
        </div>
      </div>
    </form>
  );
}

export default BucketForm;
