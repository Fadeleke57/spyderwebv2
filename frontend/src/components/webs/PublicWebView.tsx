import React from "react";
import { Web } from "@/types/web";
import { useGetAllImagesForWeb } from "@/hooks/webs";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import Image from "next/image";
import { ImageModal } from "../utility/ImageModal";

function PublicWebView({ web }: { web: Web }) {
  const { data: imageUrls, isLoading: imagesLoading } =
    useGetAllImagesForWeb(web.webId);
  const [images, setImages] = React.useState<string[]>([]);
  const [imageModalOpen, setImageModalOpen] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (imageUrls) {
      setImages(imageUrls);
    }
  }, [web, imageUrls, images]);

  const handleImageClick = (e: React.MouseEvent, imageUrl: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedImage(imageUrl);
    setImageModalOpen(true);
  };

  return (
    <div className="grid w-full items-start gap-6">
      <div className="grid gap-6 rounded-lg pb-2 pt-4 px-4">
        <div>
          <div className="flex flex-col space-y-2">
            <small className="text-sm font-medium leading-none text-violet-500 dark:text-violet-400">
              {web?.visibility === "Private" ? "Private" : "Public"}
            </small>
            <span id="name" className="text-md font-semibold">
              {web?.name || "Untitled"}
            </span>
            <span className="text-sm text-muted-foreground">
              {web?.description || "No description"}
            </span>
          </div>
        </div>
      </div>
      {images.length > 0 && (
        <ScrollArea className="w-full flex flex-row px-4 my-2">
          {images &&
            images.map((image: string, index: number) => (
              <div key={index} className="flex-1">
                <Image
                  height={300}
                  width={500}
                  src={image}
                  alt={web.name}
                  className="rounded-md w-full border h-auto object-cover"
                  style={{ maxHeight: "400px" }}
                  onClick={(e) => handleImageClick(e, image)}
                  priority
                />
              </div>
            ))}
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
      <ImageModal
        isOpen={imageModalOpen}
        setIsOpen={setImageModalOpen}
        onClose={() => setImageModalOpen(false)}
        imageUrl={selectedImage || ""}
      />
    </div>
  );
}

export default PublicWebView;
