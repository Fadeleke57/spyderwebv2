import React, { useState, useCallback, useEffect, ChangeEvent } from "react";
import {
  useDeleteImageFromWeb,
  useFetchWebById,
  useGetAllImagesForWeb,
  useUpdateWeb,
  useUploadImageToWeb,
} from "@/hooks/webs";
import { useToast } from "../ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { debounce } from "lodash";
import { ConfirmModal } from "../utility/ConfirmModal";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import Image from "next/image";
import { Button } from "../ui/button";
import { ArrowRight, ImageIcon, Lock, X } from "lucide-react";
import DeleteModal from "../utility/DeleteModal";
import {
  MAX_IMAGE_SIZE,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_GIF_TYPES,
} from "@/lib/utils";
import ConfirmImageModal from "../utility/ConfirmImageModal";
import { ImageModal } from "../utility/ImageModal";
import { DynamicTextarea } from "../utility/DynamicScrollbar";
import { SHOWCASE_IMAGE } from "@/lib/consts";
import { useUser } from "@/context/UserContext";
import { TagsPopover } from "../home/TagsPopover";
import SimpleTooltip from "../utility/SimpleTooltip";
import Link from "next/link";

const webSchema = z.object({
  name: z.string().min(1, { message: "Claim is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  visibility: z.enum(["Private", "Public", "Invite"], {}).default("Private"),
});

type WebFormValues = z.infer<typeof webSchema>;

type WebConfig = {
  name: string;
  description: string;
  visibility: "Private" | "Public" | "Invite";
};

function WebForm({ webId }: { webId: string }) {
  const { data: web, refetch: refetchWeb } = useFetchWebById(webId);
  const { user } = useUser();

  const {
    data: imageUrls,
    isLoading: imagesLoading,
    refetch: refetchImages,
  } = useGetAllImagesForWeb(web && web.webId);

  const { mutateAsync: deleteImage } = useDeleteImageFromWeb();
  const { mutateAsync: uploadImages, isPending: addingImages } =
    useUploadImageToWeb(web && web.webId);
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
  const isOwner = web && user && web.userId === user.id;

  useEffect(() => {
    if (imageUrls) {
      setImages(imageUrls);
    }
  }, [web, imageUrls, images]);

  const { mutateAsync: updateWeb, isPending } = useUpdateWeb(web && web.webId);
  const { toast } = useToast();

  const [webConfig, setWebConfig] = useState<WebConfig>({
    name: web ? web.name : "",
    description: web ? web.description : "",
    visibility: web ? web.visibility : "Private",
  });

  const form = useForm<WebFormValues>({
    resolver: zodResolver(webSchema),
  });

  // debounce the submit function to reduce frequency of autosaves
  const debouncedSave = useCallback(
    debounce(async (config) => {
      try {
        await updateWeb({
          name: config.name,
          description: config.description,
          visibility: config.visibility,
        });
        refetchWeb();
        toast({ title: "Changes saved." });
      } catch (error: any) {
        toast({
          title: "Error updating web",
          description: error.message,
          variant: "destructive",
        });
      }
    }, 1000),
    []
  );

  const onConfigChange = (newConfig: WebConfig) => {
    setWebConfig(newConfig);
    debouncedSave(newConfig);
  };

  const onTitleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onConfigChange({
      ...webConfig,
      name: e.target.value || "Untitled",
    });
  };

  const onDescriptionChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    onConfigChange({
      ...webConfig,
      description: event.target.value,
    });
  };

  const handleToggleVisibility = async (visibility: "Private" | "Public") => {
    try {
      await updateWeb({
        name: webConfig.name,
        description: webConfig.description,
        visibility: visibility,
      });
      setWebConfig({
        ...webConfig,
        visibility,
      });
      refetchWeb();
      toast({
        title: `Web visibility updated to ${visibility.toLowerCase()}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating web",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteImage = useCallback(async () => {
    if (!selectedImage || !web) {
      return;
    }
    try {
      await deleteImage({ webId: web.webId, imageUrl: selectedImage });
      setDeleteModalOpen(false);
    } catch (error: any) {
      toast({
        title: "Error deleting image",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [selectedImage, deleteImage, toast, web]);

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

  if (!isOwner) {
    return null;
  }

  return (
    <form className="relative grid w-full items-start">
      <div className="grid gap-4 rounded-lg pb-4 pt-4 px-4">
        <div>
          <div className="flex flex-col">
            <div className="flex flex-col">
              <small className="text-sm font-semibold leading-none text-violet-500 dark:text-violet-400/80 flex flex-row items-center">
                {webConfig.visibility}{" "}
                {webConfig.visibility === "Private" && (
                  <Lock size={12} className="ml-1" />
                )}
                {isOwner && (
                  <ConfirmModal
                    action={() =>
                      handleToggleVisibility(
                        webConfig.visibility === "Private"
                          ? "Public"
                          : "Private"
                      )
                    }
                    actionButtonStr={
                      webConfig.visibility === "Private"
                        ? "Publish"
                        : "Make Private"
                    }
                    actionStr={
                      "Are you sure you want to " +
                      (webConfig.visibility === "Private"
                        ? "publish this web"
                        : "make this web private") +
                      "?"
                    }
                  >
                    <span className="dark:text-foreground bg-muted py-1 px-2 rounded-md cursor-pointer ml-2">
                      {" "}
                      {webConfig.visibility === "Private"
                        ? "Publish"
                        : "Switch to Private"}
                    </span>
                  </ConfirmModal>
                )}
              </small>
              <div className="flex flex-row items-center gap-2">
                <SimpleTooltip content="Upload images" sideOffset={0}>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-neon w-fit h-fit p-0"
                  >
                    <label htmlFor="image-file">
                      <ImageIcon
                        size={17}
                        className="cursor-pointer hover:text-neon/70"
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
                </SimpleTooltip>
                <SimpleTooltip content="Tags" sideOffset={0}>
                  <TagsPopover />
                </SimpleTooltip>
              </div>
            </div>
            <DynamicTextarea
              id="name"
              placeholder="Give it a title..."
              defaultValue={web?.name || "Untitled"}
              {...form.register("name")}
              className="font-bold leading-tight text-md font-semibold"
              onValueChange={onTitleChange}
            />

            <DynamicTextarea
              id="description"
              placeholder="Add a description..."
              defaultValue={web?.description || ""}
              {...form.register("description")}
              className="text-lg leading-relaxed text-sm text-muted-foreground"
              onValueChange={onDescriptionChange}
            />
            {web.showcase && (
              <div className="my-4">
                <span className="font-semibold">Next Steps:</span>
                <Link
                  className="text-violet-400 hover:underline group mt-2 font-semibold flex items-center"
                  href={`/memory`}
                >
                  Install the Spydr Memory MCP{" "}
                  <ArrowRight
                    strokeWidth={4}
                    size={16}
                    className="ml-2 group-hover:translate-x-1 transition-all ease-in-out duration-300"
                  />
                </Link>
                <Link
                  className="text-violet-400 hover:underline group font-semibold flex items-center"
                  href={`/help`}
                >
                  Learn more about how to use Spydr{" "}
                  <ArrowRight
                    strokeWidth={4}
                    size={16}
                    className="ml-2 group-hover:translate-x-1 transition-all ease-in-out duration-300"
                  />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {web?.showcase && (
        <div key={-1} className="flex-1 relative">
          <Image
            height={200}
            width={400}
            src={SHOWCASE_IMAGE}
            alt={web.name}
            className="rounded-md w-full border h-auto object-cover"
            style={{ maxHeight: "300px" }}
            onClick={(e) => handleImageClick(e, SHOWCASE_IMAGE)}
            priority
          />
        </div>
      )}

      {images.length > 0 && (
        <ScrollArea className="w-full flex flex-row gap-4 px-4 my-2">
          {images &&
            images.map((image: string, index: number) => (
              <div key={index} className="flex-1 relative">
                <Image
                  height={300}
                  width={500}
                  src={image}
                  alt={(web && web.name) || "web image"}
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

export default WebForm;
