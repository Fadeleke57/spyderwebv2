import React, { useState, useCallback } from "react";
import { Bucket } from "@/types/bucket";
import { PublicUser } from "@/types/user";
import { useUpdateBucket } from "@/hooks/buckets";
import { useToast } from "../ui/use-toast";
import { useRouter } from "next/router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Textarea } from "../ui/textarea";
import { debounce } from "lodash";
import { ConfirmModal } from "../utility/ConfirmModal";
import { TagsPopover } from "../home/TagsPopover";

type FormProps = {
  bucket: Bucket;
  user: PublicUser | null;
};

const bucketSchema = z.object({
  name: z.string().min(1, { message: "Claim is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  visibility: z.enum(["Private", "Public", "Invite"], {}).default("Private"),
});

type BucketFormValues = z.infer<typeof bucketSchema>;

type BucketConfig = {
  name: string;
  description: string;
  visibility: "Private" | "Public" | "Invite";
};

function BucketForm({ bucket, user }: FormProps) {
  const isOwner = user?.id === bucket?.userId;
  const { mutateAsync: updateBucket, isPending } = useUpdateBucket(
    bucket?.bucketId
  );
  const { toast } = useToast();
  const router = useRouter();

  const [bucketConfig, setBucketConfig] = useState<BucketConfig>({
    name: bucket?.name,
    description: bucket?.description,
    visibility: bucket?.visibility,
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
          visibility: config.visibility,
        });
        toast({ title: "Changes saved." });
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
    debouncedSave(newConfig);
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

  const handleToggleVisibility = async (visibility: "Private" | "Public") => {
    try {
      await updateBucket({
        name: bucketConfig.name,
        description: bucketConfig.description,
        visibility: visibility,
      });
      setBucketConfig({
        ...bucketConfig,
        visibility,
      });
      toast({
        title: `Bucket visibility updated to ${visibility.toLowerCase()}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating bucket",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <form className="relative grid w-full items-start gap-6">
      <div className="grid gap-4 rounded-lg pb-8 pt-4 px-4">
        <div>
          <div className="flex flex-col space-y-2">
            <div className="flex flex-row items-center space-x-2 justify-between">
              <small className="text-sm font-medium leading-none text-blue-500">
                {bucketConfig.visibility}
                {isOwner && (
                  <ConfirmModal
                    action={() =>
                      handleToggleVisibility(
                        bucketConfig.visibility === "Private"
                          ? "Public"
                          : "Private"
                      )
                    }
                    actionButtonStr={
                      bucketConfig.visibility === "Private"
                        ? "Make Public"
                        : "Make Private"
                    }
                    actionStr={
                      "Are you sure you want to switch this bucket to " +
                      (bucketConfig.visibility === "Private"
                        ? "public"
                        : "private") +
                      "?"
                    }
                  >
                    <span className="text-red-500 cursor-pointer">
                      {" "}
                      (
                      {bucketConfig.visibility === "Private"
                        ? "Switch to Public"
                        : "Switch to Private"}
                      )
                    </span>
                  </ConfirmModal>
                )}
              </small>
            </div>
            <TagsPopover bucket={bucket} />
            <Textarea
              id="name"
              placeholder="Give it a title..."
              rows={1}
              defaultValue={bucket?.name || "Untitled"}
              {...form.register("name")}
              className="w-full min-h-[2rem] bg-transparent p-0 font-bold leading-tight resize-none focus:outline-none border-none bg-none p-0 ring-offset-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none m-0 py-0 text-xl font-semibold"
              onInput={(e: any) => {
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
                form.trigger("name");
              }}
              onChange={(e: any) => onTitleChange(e)}
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
              onChange={(e: any) => onDescriptionChange(e)}
            />
          </div>
        </div>
      </div>
    </form>
  );
}

export default BucketForm;
