import React, { useEffect, useState } from "react";
import { Web } from "@/types/web";
import { useGetAllImagesForWeb, useLikeWeb, useUnlikeWeb } from "@/hooks/webs";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import Image from "next/image";
import { ImageModal } from "../utility/ImageModal";
import { AnimatedStarButton } from "../explore/AnimatedStar";
import { useHideWeb, useSaveWeb, useUnsaveWeb } from "@/hooks/user";
import { useUser } from "@/context/UserContext";
import AuthModal from "../auth/AuthModal";

function PublicWebView({ web }: { web: Web }) {
  const { data: imageUrls, isLoading: imagesLoading } = useGetAllImagesForWeb(
    web.webId
  );
  const { user } = useUser();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [webLikedCount, setWebLikedCount] = useState(web.likes.length);
  const [webLiked, setWebLiked] = useState(false);
  const { mutateAsync: likeWeb } = useLikeWeb(web.webId);
  const { mutateAsync: unlikeWeb } = useUnlikeWeb(web.webId);
  const { mutateAsync: saveWeb } = useSaveWeb(web.webId);
  const { mutateAsync: unsaveWeb } = useUnsaveWeb(web.webId);
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

  const handleLikeWeb = async (e: React.MouseEvent) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    if (webLiked) {
      const numLikes = await unlikeWeb();
      if (numLikes !== undefined && numLikes !== null) {
        setWebLikedCount(numLikes);
      }
      setWebLiked(false);
    } else {
      const numLikes = await likeWeb();
      if (numLikes !== undefined && numLikes !== null) {
        setWebLikedCount(numLikes);
      }
      setWebLiked(true);
    }
  };

  useEffect(() => {
    setWebLiked(web.likes.includes(user?.id as string));
    setWebLikedCount(web.likes.length);

    if (imageUrls) {
      setImages(imageUrls);
    }
  }, [web, user, imageUrls]);

  return (
    <div className="grid w-full items-start gap-6">
      <div className="grid gap-6 rounded-lg pb-2 pt-4 px-4">
        <div>
          <div className="flex flex-col space-y-2">
            <div className="flex flex-row items-center justify-between">
              <small className="text-sm font-medium leading-none text-violet-500 dark:text-violet-400">
                {web?.visibility === "Private" ? "Private" : "Public"}
              </small>
              <div className="flex flex-row items-center space-x-2">
                <AnimatedStarButton
                  count={webLikedCount}
                  isStarred={webLiked}
                  onStarClick={handleLikeWeb}
                />
              </div>
            </div>

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
      <AuthModal
        open={authModalOpen}
        setOpen={setAuthModalOpen}
        type="like"
        referrer="webview"
      />
    </div>
  );
}

export default PublicWebView;
