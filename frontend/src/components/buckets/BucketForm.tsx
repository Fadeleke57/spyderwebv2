import React, { useState, useCallback, useEffect } from "react";
import { Bucket } from "@/types/bucket";
import { PublicUser } from "@/types/user";
import {
  useDeleteImageFromBucket,
  useGetAllImagesForBucket,
  useUpdateBucket,
} from "@/hooks/buckets";
import { useToast } from "../ui/use-toast";
import { useRouter } from "next/router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Textarea } from "../ui/textarea";
import { debounce } from "lodash";
import { ConfirmModal } from "../utility/ConfirmModal";
import { TagsPopover } from "../home/TagsPopover";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import Image from "next/image";
import { Button } from "../ui/button";
import { X } from "lucide-react";

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
  const {
    data: imageUrls,
    isLoading: imagesLoading,
    refetch: refetchImages,
  } = useGetAllImagesForBucket(bucket.bucketId);

  const { mutateAsync: deleteImage } = useDeleteImageFromBucket();
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (imageUrls) {
      setImages(imageUrls);
    }
  }, [bucket, imageUrls, images]);

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

  const handleDeleteImage = async (imageUrl: string) => {
    try {
      await deleteImage({ bucketId: bucket.bucketId, imageUrl: imageUrl });
      refetchImages();
    } catch (error: any) {
      toast({
        title: "Error deleting image",
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
            <small className="text-sm font-medium leading-none text-blue-500 dark:text-blue-400">
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
                  <span className="text-red-500 dark:text-foreground cursor-pointer">
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
      {images.length > 0 && (
        <ScrollArea className="w-full flex flex-row gap-4 px-4 my-2">
          {images &&
            images.map((image: string, index: number) => (
              <div key={index} className="flex-1 relative">
                <Image
                  height={300}
                  width={500}
                  src={image}
                  alt={bucket.name}
                  className="rounded-md w-full border h-auto object-cover"
                  style={{ maxHeight: "400px" }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 bg-black/50 hover:bg-black/70"
                  onClick={() => handleDeleteImage(image)}
                >
                  <X className="h-4 w-4 text-white" />
                </Button>
              </div>
            ))}

          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
    </form>
  );
}

export default BucketForm;
