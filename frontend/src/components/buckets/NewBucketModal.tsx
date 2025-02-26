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
import { useCreateBucket, useUploadImageToBucket } from "@/hooks/buckets";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Textarea } from "../ui/textarea";
import { ImageIcon, LoaderCircle, X } from "lucide-react";
import Image from "next/image";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { MAX_IMAGE_SIZE, ALLOWED_IMAGE_TYPES, ALLOWED_GIF_TYPES } from "@/lib/utils";

const bucketSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().min(0, { message: "Description is required" }),
  visibility: z.enum(["Private", "Public", "Invite"]).default("Private"),
});

type BucketFormValues = z.infer<typeof bucketSchema>;

type BucketConfig = {
  name: string;
  description: string;
  visibility: "Private" | "Public" | "Invite";
};

const TOGGLE_MODAL_KEYBOARD_SHORTCUT = "x";

export function NewBucketModal({ children }: { children: React.ReactNode }) {
  //make the button more flexible
  const router = useRouter();
  const { toast } = useToast();
  const { mutateAsync: createBucket, isPending: creatingBucket } =
    useCreateBucket();
  const { mutateAsync: uploadImages, isPending: addingImages } =
    useUploadImageToBucket();
  const [bucketConfig, setBucketConfig] = useState<BucketConfig>({
    name: "Untitled",
    description: "",
    visibility: "Private",
  });
  const [imageConfig, setImageConfig] = useState<{
    stagedImages: File[];
    stagedGifs: File[];
  }>({
    stagedImages: [],
    stagedGifs: [],
  });

  const isMobile = useIsMobile();

  const form = useForm<BucketFormValues>({
    resolver: zodResolver(bucketSchema),
  });
  const [open, setOpen] = useState(false);

  //toggle modal
  const toggleModal = useCallback(() => {
    return setOpen((open) => !open);
  }, [setOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === TOGGLE_MODAL_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        toggleModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleModal]);

  const onSubmit: SubmitHandler<BucketFormValues> = async (data) => {
    try {
      const bucketId = await createBucket({
        name: bucketConfig.name,
        description: bucketConfig.description,
        visibility: bucketConfig.visibility,
      });

      setBucketConfig({
        name: "Untitled",
        description: "",
        visibility: "Private",
      });

      toast({
        title: "Bucket created",
        description: `Successfully created bucket.`,
      });

      try {
        if (imageConfig.stagedImages.length || imageConfig.stagedGifs.length) {
          const imageKeys = await uploadImages({
            bucketId: bucketId,
            files: [...imageConfig.stagedImages, ...imageConfig.stagedGifs],
          });
        }

        setImageConfig({
          stagedImages: [],
          stagedGifs: [],
        });

        setOpen(false);
        form.reset();
        window.location.href = `/bucket/${bucketId}`;
      } catch (error: any) {
        toast({
          title: "Error uploading images",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error creating bucket",
        description: error.message,
        variant: "destructive",
      });
    }
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
    }
  };

  const handleStageGif = (files: FileList | null) => {
    if (!files) return;

    const validFiles = Array.from(files).filter((file) =>
      validateFile(file, true)
    );
    if (validFiles.length > 0) {
      setImageConfig((prev) => ({
        ...prev,
        stagedGifs: [...validFiles, ...prev.stagedGifs],
      }));
    }
  };

  const removeFile = (index: number, isGif: boolean = false) => {
    setImageConfig((prev) => ({
      ...prev,
      [isGif ? "stagedGifs" : "stagedImages"]: prev[
        isGif ? "stagedGifs" : "stagedImages"
      ].filter((_, i) => i !== index),
    }));
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
      {addingImages || creatingBucket ? (
        <DialogContent className="max-w-[350px] h-[60dvh] px-8 rounded-md lg:max-w-[600px] lg:h-[90dvh] flex flex-col gap-2 items-center justify-center">
          <span>Setting up your bucket...</span>
          <LoaderCircle className="animate-spin" />
        </DialogContent>
      ) : (
        <DialogContent className="max-w-[350px] h-[60dvh] px-8 rounded-md lg:max-w-[600px] lg:h-[90dvh]">
          <DialogHeader>
            <DialogTitle className="text-left">
              What would you like to start thinking about?
            </DialogTitle>
            <DialogDescription className="text-left">
              Create a knowledge base.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className={"flex flex-col h-[35dvh] lg:h-[60dvh]"}>
              <div className="flex flex-col space-y-1">
                <Textarea
                  id="name"
                  rows={1}
                  placeholder="Give it a title..."
                  {...form.register("name")}
                  className="w-full min-h-[2rem] bg-transparent p-0 text-3xl font-bold leading-tight resize-none focus:outline-none border-none bg-none p-0 ring-offset-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none m-0 py-0 text-xl font-semibold"
                  onInput={(e: any) => {
                    e.target.style.height = "auto";
                    e.target.style.height = `${e.target.scrollHeight}px`;
                    form.trigger("name");
                  }}
                  onChange={(e: any) => onTitleChange(e)}
                  maxLength={100}
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
                />{" "}
                <div>
                  <small className="text-red-500">
                    {form.formState.errors.description?.message}
                  </small>
                </div>
              </div>

              {(imageConfig.stagedImages.length > 0 ||
                imageConfig.stagedGifs.length > 0) && (
                <ScrollArea className="w-full whitespace-wrap pt-16 w-full lg:w-[500px] rounded-md">
                  <div className="flex flex-row w-full space-x-4 pb-4 pr-4">
                    {imageConfig.stagedImages.map((file, index) => (
                      <figure key={index} className="shrink-0 relative">
                        <div className="rounded-md w-full h-[150px] lg:h-[250px]">
                          <Image
                            width={150}
                            height={250}
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index}`}
                            className="object-cover w-full h-full rounded-md"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6 bg-black/50 hover:bg-black/70"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-4 w-4 text-white" />
                          </Button>
                        </div>
                        <figcaption className="pt-2 text-xs text-muted-foreground">
                          Photo
                        </figcaption>
                      </figure>
                    ))}
                    {imageConfig.stagedGifs.map((file, index) => (
                      <figure key={index} className="shrink-0 relative">
                        <div className="overflow-hidden rounded-md w-[150px] lg:h-[250px]">
                          <Image
                            width={150}
                            height={250}
                            src={URL.createObjectURL(file)}
                            alt={`Gif Preview ${index}`}
                            className="object-cover w-full h-full"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6 bg-black/50 hover:bg-black/70"
                            onClick={() => removeFile(index, true)}
                          >
                            <X className="h-4 w-4 text-white" />
                          </Button>
                        </div>
                        <figcaption className="pt-2 text-xs text-muted-foreground">
                          Gif
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              )}
              <ScrollBar />
            </ScrollArea>
          </form>
          <DialogFooter className="flex flex-row items-end justify-between">
            <Button
              disabled={creatingBucket}
              onClick={form.handleSubmit(onSubmit)}
              type="submit"
              className="w-[100px]"
            >
              {creatingBucket ? "Saving..." : "Save Draft"}
            </Button>

            <div className="flex flex-row items-center">
              <Button
                disabled
                type="button"
                variant="ghost"
                className="hover:bg-transparent p-0"
              >
                <label htmlFor="gif-file">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12.75 8.25v7.5m6-7.5h-3V12m0 0v3.75m0-3.75H18M9.75 9.348c-1.03-1.464-2.698-1.464-3.728 0-1.03 1.465-1.03 3.84 0 5.304 1.03 1.464 2.699 1.464 3.728 0V12h-1.5M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
                    />
                  </svg>
                </label>
                <input
                  type="file"
                  id="gif-file"
                  accept="image/gif"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  hidden
                  onChange={(e) => handleStageGif(e.target.files)}
                />
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="hover:bg-transparent"
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
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}
