import React, { useState, useCallback, useEffect } from "react";
import { Bucket } from "@/types/bucket";
import { PublicUser } from "@/types/user";
import {
  useDeleteImageFromBucket,
  useGetAllImagesForBucket,
  useUpdateBucket,
  useUploadImageToBucket,
} from "@/hooks/buckets";
import { useToast } from "../ui/use-toast";
import { useRouter } from "next/router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Textarea } from "../ui/textarea";
import { debounce, set } from "lodash";
import { ConfirmModal } from "../utility/ConfirmModal";
import { TagsPopover } from "../home/TagsPopover";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import Image from "next/image";
import { Button } from "../ui/button";
import { ImageIcon, X } from "lucide-react";
import DeleteModal from "../utility/DeleteModal";
import {
  MAX_IMAGE_SIZE,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_GIF_TYPES,
} from "@/lib/utils";
import ConfirmImageModal from "../utility/ConfirmImageModal";
import { ImageModal } from "../utility/ImageModal";

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
  const { mutateAsync: uploadImages, isPending: addingImages } =
    useUploadImageToBucket();
  const [images, setImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [imageConfig, setImageConfig] = useState<{
    stagedImages: File[];
  }>({
    stagedImages: [],
  });
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);

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

  const handleDeleteImage = useCallback(async () => {
    if (!selectedImage) {
      return;
    }
    try {
      await deleteImage({ bucketId: bucket.bucketId, imageUrl: selectedImage });
      refetchImages();
      setDeleteModalOpen(false);
    } catch (error: any) {
      toast({
        title: "Error deleting image",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [selectedImage, deleteImage, refetchImages]);

  const handleOpenDeleteModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setDeleteModalOpen(true);
  };

  const handleImageClick = (e: React.MouseEvent, imageUrl: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedImage(imageUrl);
    setImageModalOpen(true);
  };

  const validateFile = (file: File, isGif: boolean = false) => {
    if (file.size > MAX_IMAGE_SIZE) {
      toast({
        title: "File too large",
        description: "Maximum file size is 5MB",
        variant: "destructive",
      });
      return false;
    }

    const allowedTypes = isGif ? ALLOWED_GIF_TYPES : ALLOWED_IMAGE_TYPES;
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: `Please upload ${
          isGif ? "GIF" : "JPG, PNG, or WebP"
        } files only`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleUploadImages = async () => {
    if (!imageConfig.stagedImages.length) return;

    try {
      await uploadImages({
        bucketId: bucket.bucketId,
        files: imageConfig.stagedImages,
      });

      setImageConfig((prev) => ({ ...prev, stagedImages: [] }));
      setConfirmModalOpen(false);
      refetchImages();

      toast({
        title: "Images uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error uploading images",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRemoveStagedImage = (index: number) => {
    setImageConfig((prev) => ({
      ...prev,
      stagedImages: prev.stagedImages.filter((_, i) => i !== index),
    }));
  };

  const handleStageImage = (files: FileList | null) => {
    if (!files) return;

    if (imageConfig.stagedImages.length + files.length > 4) {
      toast({
        title: "Too many files",
        description: "Please upload a maximum of 4 files",
        variant: "destructive",
      });
      return;
    }

    const validFiles = Array.from(files).filter((file) => validateFile(file));
    if (validFiles.length > 0) {
      setImageConfig((prev) => ({
        ...prev,
        stagedImages: [...validFiles, ...prev.stagedImages],
      }));
      setConfirmModalOpen(true);
    }
  };

  return (
    <form className="relative grid w-full items-start">
      <div className="grid gap-4 rounded-lg pb-4 pt-4 px-4">
        <div>
          <div className="flex flex-col">
            <div className="flex flex-col">
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
              <Button
                type="button"
                variant="ghost"
                className="hover:bg-transparent w-fit p-0"
              >
                <label htmlFor="image-file">
                  <ImageIcon
                    size={17}
                    className="cursor-pointer hover:text-muted-foreground"
                  />
                </label>
                <input
                  type="file"
                  id="image-file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  className="absolute inset-0 opacity-0 cursor-pointer p-0"
                  hidden
                  onChange={(e) => handleStageImage(e.target.files)}
                />
              </Button>
            </div>

            <Textarea
              id="name"
              placeholder="Give it a title..."
              rows={1}
              defaultValue={bucket?.name || "Untitled"}
              {...form.register("name")}
              className="w-full min-h-[2rem] bg-transparent p-0 font-bold leading-tight resize-none focus:outline-none border-none bg-none p-0 ring-offset-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none m-0 py-0 text-md font-semibold"
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
                  onClick={(e) => handleImageClick(e, image)}
                  priority
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 bg-black/50 hover:bg-black/70"
                  onClick={() => handleOpenDeleteModal(image)}
                >
                  <X className="h-4 w-4 text-white" />
                </Button>
              </div>
            ))}

          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
      <DeleteModal
        isPending={isPending}
        onDelete={handleDeleteImage}
        open={deleteModalOpen}
        setOpen={setDeleteModalOpen}
        itemType="image"
      />
      <ConfirmImageModal
        open={confirmModalOpen}
        setOpen={setConfirmModalOpen}
        stagedImages={imageConfig.stagedImages}
        onConfirm={handleUploadImages}
        onRemoveImage={handleRemoveStagedImage}
        isPending={addingImages}
      />
      <ImageModal
        isOpen={imageModalOpen}
        setIsOpen={setImageModalOpen}
        onClose={() => setImageModalOpen(false)}
        imageUrl={selectedImage || ""}
      />
    </form>
  );
}

export default BucketForm;
