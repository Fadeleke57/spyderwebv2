import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { useCreateWeb, useUploadImageToWeb } from "@/hooks/webs";
import { useCallback, useEffect, useState } from "react";
import { Textarea } from "../ui/textarea";
import { ImageIcon, X } from "lucide-react";
import Image from "next/image";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  MAX_IMAGE_SIZE,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_GIF_TYPES,
} from "@/lib/utils";

const webSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }).max(100),
  description: z.string().min(0).max(150),
  visibility: z.enum(["Private", "Public", "Invite"]).default("Private"),
});

type WebFormValues = z.infer<typeof webSchema>;

type WebConfig = {
  name: string;
  description: string;
  visibility: "Private" | "Public" | "Invite";
};

const TOGGLE_MODAL_KEYBOARD_SHORTCUT = "x";

export function NewWebModal({ children }: { children: React.ReactNode }) {
  const [webId, setWebId] = useState<string | null>(null);
  const { toast } = useToast();
  const { mutateAsync: createWeb, isPending: creatingWeb } = useCreateWeb();
  const { mutateAsync: uploadImages, isPending: addingImages } =
    useUploadImageToWeb(webId);
  const [webConfig, setWebConfig] = useState<WebConfig>({
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

  const form = useForm<WebFormValues>({
    resolver: zodResolver(webSchema),
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

  const onSubmit: SubmitHandler<WebFormValues> = async (data) => {
    try {
      const webId = await createWeb({
        name: webConfig.name,
        description: webConfig.description,
        visibility: webConfig.visibility,
      });
      if (!webId) {
        toast({
          title: "Error creating web",
          description: "Failed to create web.",
          variant: "destructive",
        });
        return;
      }
      setWebId(webId);

      setWebConfig({
        name: "Untitled",
        description: "",
        visibility: "Private",
      });

      toast({
        title: "Web created",
        description: `Successfully created web.`,
      });

      try {
        if (imageConfig.stagedImages.length || imageConfig.stagedGifs.length) {
          const imageKeys = await uploadImages({
            files: [...imageConfig.stagedImages, ...imageConfig.stagedGifs],
          });
        }

        setImageConfig({
          stagedImages: [],
          stagedGifs: [],
        });

        setOpen(false);
        form.reset();
        window.location.href = `/web/${webId}`;
      } catch (error: any) {
        toast({
          title: "Error uploading images",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error creating web",
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
        stagedImages: [...prev.stagedImages, ...validFiles],
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

  const onTitleChange = (event: any) => {
    setWebConfig({
      ...webConfig,
      name: event.target.value || "Untitled",
    });
  };

  const onDescriptionChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setWebConfig({
      ...webConfig,
      description: event.target.value,
    });
  };

  useEffect(() => {
    if (addingImages || creatingWeb) {
      toast({
        title: "Setting up your web...",
        description: "Please wait.",
        variant: "default",
      });
    }
  }, [addingImages, creatingWeb, toast]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-[350px] flex flex-col gap-8 rounded-md px-8 lg:max-w-[600px]">
        <div className="relative flex flex-col min-h-[60dvh] max-h-[90dvh] gap-4 py-4 h-full">
          <DialogHeader>
            <DialogTitle className="text-left">
              What would you like to start thinking about?
            </DialogTitle>
            <DialogDescription className="text-left">
              Create a new memory store
            </DialogDescription>
          </DialogHeader>

          {/* Use a flex-col form to manage layout and spacing */}
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex max-h-[80%] min-h-[80%] flex-col justify-between"
          >
            {/* Inputs Container */}
            <div className="flex flex-col space-y-2">
              <Textarea
                id="name"
                rows={1}
                placeholder="Give it a title..."
                {...form.register("name")}
                className="w-full resize-none border-none bg-transparent p-0 text-xl font-semibold leading-tight ring-offset-transparent focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                onInput={(e: React.FormEvent<HTMLTextAreaElement>) => {
                  const target = e.currentTarget;
                  target.style.height = "auto";
                  target.style.height = `${target.scrollHeight}px`;
                  form.trigger("name");
                }}
                onChange={onTitleChange}
                maxLength={100}
              />
              <Textarea
                id="description"
                rows={1}
                placeholder="Enter a brief description of this memory store..."
                {...form.register("description")}
                className="w-full resize-none border-none bg-transparent p-0 text-sm text-muted-foreground ring-offset-transparent focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                onInput={(e: React.FormEvent<HTMLTextAreaElement>) => {
                  const target = e.currentTarget;
                  target.style.height = "auto";
                  target.style.height = `${target.scrollHeight}px`;
                }}
                onChange={onDescriptionChange}
                maxLength={400} // Max length for description
              />
              <div>
                <small className="text-red-500">
                  {form.formState.errors.description?.message}
                </small>
              </div>
            </div>

            {/* Horizontal Scroll for Images */}
            {(imageConfig.stagedImages.length > 0 ||
              imageConfig.stagedGifs.length > 0) && (
              <ScrollArea className="w-full whitespace-nowrap rounded-md mb-8 mt-4">
                <div className="flex w-max space-x-4 pb-4">
                  {imageConfig.stagedImages.map((file, index) => (
                    <figure key={index} className="relative shrink-0">
                      <div className="h-[150px] w-full rounded-md lg:h-[250px]">
                        <Image
                          width={150}
                          height={250}
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index}`}
                          className="h-full w-full rounded-md object-cover"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2 h-6 w-6 bg-black/50 hover:bg-black/70"
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
                    <figure key={index} className="relative shrink-0">
                      <div className="h-[150px] w-[150px] overflow-hidden rounded-md lg:h-[250px]">
                        <Image
                          width={150}
                          height={250}
                          src={URL.createObjectURL(file)}
                          alt={`Gif Preview ${index}`}
                          className="h-full w-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2 h-6 w-6 bg-black/50 hover:bg-black/70"
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

            {/* Action Buttons */}
            <div className="absolute bottom-0 flex flex-row items-center w-full justify-between pt-2">
              <Button
                disabled={creatingWeb}
                type="submit"
                className="w-[100px]"
              >
                {creatingWeb ? "Saving..." : "Save Draft"}
              </Button>

              <div className="flex flex-row items-center">
                <Button
                  disabled
                  type="button"
                  variant="ghost"
                  className="p-0 hover:bg-transparent"
                >
                  <label htmlFor="gif-file" className="cursor-pointer">
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
                    className="hidden"
                    onChange={(e) => handleStageGif(e.target.files)}
                  />
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="hover:bg-transparent"
                >
                  <label htmlFor="image-file" className="cursor-pointer">
                    <ImageIcon
                      size={17}
                      className="hover:text-muted-foreground"
                    />
                  </label>
                  <input
                    type="file"
                    id="image-file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => handleStageImage(e.target.files)}
                  />
                </Button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
