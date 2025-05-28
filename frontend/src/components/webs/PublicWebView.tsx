import React, { useEffect, useState } from "react";
import {
  useFetchWebById,
  useGetAllImagesForWeb,
  useLikeWeb,
  useUnlikeWeb,
} from "@/hooks/webs";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import Image from "next/image";
import { ImageModal } from "../utility/ImageModal";
import { AnimatedStarButton } from "../explore/AnimatedStar";
import { useUser } from "@/context/UserContext";
import AuthModal from "../auth/AuthModal";

function PublicWebView({ webId }: { webId: string }) {
  const { data: web } = useFetchWebById(webId);
  const { data: imageUrls, isLoading: imagesLoading } = useGetAllImagesForWeb(
    web && web.webId
  );
  const { user } = useUser();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [webLikedCount, setWebLikedCount] = useState(
    (web && web.likes.length) || 0
  );
  const [webLiked, setWebLiked] = useState(false);
  const { mutateAsync: likeWeb } = useLikeWeb(web && web.webId);
  const { mutateAsync: unlikeWeb } = useUnlikeWeb(web && web.webId);
  const [images, setImages] = useState<string[]>([]);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const isOwner = web && user && web.userId === user.id;

  useEffect(() => {
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
    if (!web) {
      return;
    }
    setWebLiked(web.likes.includes(user?.id as string));
    setWebLikedCount(web.likes.length);

    if (imageUrls) {
      setImages(imageUrls);
    }
  }, [web, user, imageUrls]);

  if (isOwner) {
    return null;
  }

  return (
    <div className="grid w-full items-start gap-6">
      <div className="grid gap-6 rounded-lg pb-2 pt-4 px-4">
        <div>
          <div className="flex flex-col space-y-2">
            <div className="flex flex-row items-center justify-between">
              <small className="text-sm font-semibold leading-none text-violet-500 dark:text-violet-400/80">
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
                  alt={(web && web.name) || "web image"}
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
