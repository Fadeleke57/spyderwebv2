import { useEffect, useState } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Web } from "@/types/web";
import { formatDistanceToNow } from "date-fns";
import { IterationCcw, EllipsisIcon, EyeOff, Bookmark } from "lucide-react";
import { useGetAllImagesForWeb, useLikeWeb, useUnlikeWeb } from "@/hooks/webs";
import UserAvatar from "../utility/UserAvatar";
import {
  useFetchUserById,
  useHideWeb,
  useSaveWeb,
  useUnsaveWeb,
} from "@/hooks/user";
import { IterateModal } from "../utility/IterateModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Skeleton } from "../ui/skeleton";
import { AuthModal } from "../auth/AuthModal";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import Image from "next/image";
import { ScrollBar } from "../ui/scroll-area";
import { PublicUser } from "@/types/user";
import { ImageModal } from "../utility/ImageModal";
import { SkeletonCard } from "../utility/SkeletonCard";
import { AnimatedStarButton } from "./AnimatedStar";
import { formatText } from "@/lib/utils";
import { useRouter } from "next/router";

export function WebCard({ web, user }: { web: Web; user?: PublicUser | null }) {
  const [webLikedCount, setWebLikedCount] = useState(
    (web && web.likes.length) || 0
  );
  const router = useRouter();
  const [webSaved, setWebSaved] = useState(false);
  const [webHidden, setWebHidden] = useState(false);
  const [webLiked, setWebLiked] = useState(false);
  const [webIterated, setWebIterated] = useState(false);

  const { data: webOwner, isLoading: webOwnerLoading } = useFetchUserById(
    web.userId
  );
  const { data: imageUrls, isLoading: imagesLoading } = useGetAllImagesForWeb(
    web.webId
  );
  const { data: iteratedFromUser, isLoading: iteratedFromLoading } =
    useFetchUserById(web.iteratedFrom || "");
  const [webIterationsCount, setWebIterationsCount] = useState(
    web.iterations.length
  );

  const [images, setImages] = useState<string[]>([]);
  const [iteratedFrom, setIteratedFrom] = useState<any | null>(null);
  const [showIterateModal, setShowIterateModal] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");

  const { mutateAsync: likeWeb } = useLikeWeb(web.webId);
  const { mutateAsync: unlikeWeb } = useUnlikeWeb(web.webId);
  const { mutateAsync: hideWeb } = useHideWeb(web.webId);
  const { mutateAsync: saveWeb } = useSaveWeb(web.webId);
  const { mutateAsync: unsaveWeb } = useUnsaveWeb(web.webId);

  const handleStopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const handleHideWeb = async (e: React.MouseEvent) => {
    handleStopPropagation(e);
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    setWebHidden(true);
    await hideWeb();
  };

  const handleUnhideWeb = async (e: React.MouseEvent) => {
    handleStopPropagation(e);
    setWebHidden(false);
    // Assuming useHideWeb toggles, or you have a useUnhideWeb hook
    // For this example, let's assume calling hideWeb again might unhide or there's another mechanism.
    // If not, this part might need adjustment based on how unhiding is actually implemented.
    // Re-calling hideWeb() might not be the correct unhide logic.
    // For now, we'll keep it as per the original code, but it's worth noting.
    await hideWeb(); // This might be a placeholder for actual unhide logic
  };

  const handleSaveWeb = async (e: React.MouseEvent) => {
    handleStopPropagation(e);
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    if (webSaved) {
      await unsaveWeb();
      setWebSaved(false);
    } else {
      await saveWeb();
      setWebSaved(true);
    }
  };

  const handleLikeWeb = async (e: React.MouseEvent) => {
    handleStopPropagation(e);
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

  const handleIterateWeb = (e: React.MouseEvent) => {
    handleStopPropagation(e);
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    if (webIterated || web.iterations.includes(user?.id || "")) {
      return;
    }
    setShowIterateModal(true);
  };

  const handleImageClick = (e: React.MouseEvent, imageUrl: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  useEffect(() => {
    setWebLiked(web.likes.includes(user?.id as string));
    setWebIterated(web.iterations.includes(user?.id as string));
    setWebLikedCount(web.likes.length);
    setWebIterationsCount(web.iterations.length);

    if (user) {
      setWebSaved(user.websSaved?.includes(web.webId) || false);
      setWebHidden(user.websHidden?.includes(web.webId) || false);
    }

    if (iteratedFromUser) {
      setIteratedFrom(iteratedFromUser);
    }

    if (imageUrls) {
      setImages(imageUrls);
    }
  }, [web, user, iteratedFromUser, imageUrls]);

  if (user && user.websHidden.includes(web.webId)) {
    return null;
  }

  if (webOwnerLoading || iteratedFromLoading) {
    return <SkeletonCard />;
  }

  if (webHidden) {
    return (
      <Card className="w-full relative mx-auto min-h-[60px] border-none bg-background hover:bg-muted py-2 border-b-2">
        <div className="flex items-center justify-between px-6">
          <p className="text-sm text-muted-foreground">
            Web hidden successfully
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUnhideWeb}
            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-500"
          >
            Undo
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div
      onClick={() => router.push(`/web/${web.webId}`)}
      className="flex flex-col hover:cursor-pointer"
    >
      <Card className="w-full relative mx-auto min-h-[80px] bg-background hover:bg-muted p-6 pb-3 pt-4 rounded-none lg:rounded-xl">
        <div className="flex flex-row gap-2 w-full">
          <div>
            <UserAvatar showTooltip userId={web?.userId} dimension={30} />
          </div>
          <div className={`w-full flex flex-col gap-2`}>
            <div className="flex flex-row justify-between w-full">
              <div className="flex flex-col">
                <div className="flex flex-row items-center">
                  {webOwnerLoading ? (
                    <Skeleton className="h-3 w-[100px] lg:w-[130px] rounded-xl"></Skeleton>
                  ) : (
                    <p className="text-[.8rem] text-muted-foreground dark:text-foreground font-semibold">
                      {webOwner?.full_name || webOwner?.username}
                    </p>
                  )}
                  <p className="ml-2 text-sm text-muted-foreground dark:text-violet-400/80 font-semibold flex items-center pt-[2px]">
                    *
                  </p>
                  <p className="ml-2 text-xs text-muted-foreground font-normal">
                    {/* MODIFIED_BLOCK_FOR_WEB_UPDATED_START */}
                    {web?.updated &&
                      (() => {
                        let dateInstance;
                        // Check if web.updated is a string to decide on 'Z' suffix logic
                        if (typeof web.updated === "string") {
                          // Append 'Z' if it's a string and doesn't already have 'Z' or a timezone offset
                          if (
                            !web.updated.endsWith("Z") &&
                            !/[+-]\d{2}(:?\d{2})?$/.test(web.updated)
                          ) {
                            dateInstance = new Date(web.updated + "Z");
                          } else {
                            dateInstance = new Date(web.updated);
                          }
                        } else {
                          // If web.updated is a number (timestamp) or already a Date object
                          dateInstance = new Date(web.updated);
                        }

                        // Check if the parsed date is valid
                        if (isNaN(dateInstance.getTime())) {
                          dateInstance = new Date(); // Fallback to today if parsing failed
                        }
                        return formatDistanceToNow(dateInstance, {
                          addSuffix: true,
                        });
                      })()}
                    {/* MODIFIED_BLOCK_FOR_WEB_UPDATED_END */}
                  </p>
                </div>
                {iteratedFrom ? (
                  <p className="text-xs text-muted-foreground font-normal">
                    Iterated From{" "}
                    <span className="font-semibold text-violet-500 dark:text-violet-400/80">
                      @{iteratedFrom.username}
                    </span>
                  </p>
                ) : web.iteratedFrom ? (
                  <Skeleton className="h-3 w-[100px] lg:w-[130px] rounded-xl"></Skeleton>
                ) : null}
              </div>

              <div className="-mt-2">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger className="rounded-full hover:bg-slate-300 dark:hover:bg-violet-400/50 p-2 border-none focus:outline-none text-muted-foreground dark:text-foreground">
                    <EllipsisIcon size={16} onClick={handleStopPropagation} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent onClick={handleStopPropagation}>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={handleSaveWeb}
                    >
                      <Bookmark
                        size={16}
                        className={`mr-2 ${webSaved && "fill-foreground"}`}
                      />
                      {webSaved ? "Unsave" : "Save"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={handleHideWeb}
                    >
                      <EyeOff size={16} className="mr-2" />
                      Hide
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div
              className={`flex flex-col gap-2 ${!web.iteratedFrom && "-mt-4"}`}
            >
              <CardHeader className="overflow-hidden p-0 m-0">
                <CardTitle className="break-words hover:cursor-pointer mt-3 text-sm leading-tight hyphens-auto text-foreground ">
                  {web.name}
                </CardTitle>
                <CardDescription className="hyphens-auto mb-8 max-w-6xl text-muted-foreground">
                  {formatText(web.description, 500)}
                </CardDescription>
              </CardHeader>

              {images.length > 0 && (
                <>
                  <ScrollArea className="w-full flex flex-row">
                    <div className="flex-1 w-full max-h-[400px] overflow-hidden mb-2 rounded-lg -ml-1 ">
                      {imagesLoading ? (
                        <Skeleton className="h-[300px] w-full" />
                      ) : (
                        <Image
                          height={300}
                          width={500}
                          src={images[0]}
                          alt={web.name}
                          className="rounded-xl w-full border h-auto object-cover"
                          onClick={(e) => handleImageClick(e, images[0])}
                        />
                      )}
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                  <ImageModal
                    isOpen={showImageModal}
                    setIsOpen={setShowImageModal}
                    onClose={() => setShowImageModal(false)}
                    imageUrl={selectedImage}
                    title={web.name}
                    description={web.description}
                  />
                </>
              )}
            </div>
            <div className="-ml-1 flex flex-row items-center justify-between">
              <div className="flex flex-row space-x-1">
                <div className="flex flex-row items-center space-x-1">
                  <AnimatedStarButton
                    isStarred={webLiked}
                    count={webLikedCount}
                    onStarClick={handleLikeWeb}
                  />
                </div>
                <div
                  className="flex flex-row items-center space-x-1 text-muted-foreground rounded-full hover:bg-neon/10 hover:text-neon dark:hover:bg-neon/10 p-1 transition ease-in"
                  onClick={handleIterateWeb}
                >
                  <p
                    className={`text-sm ${
                      webIterated ? "text-neon dark:text-neon" : ""
                    }`}
                  >
                    {webIterationsCount}
                  </p>
                  <IterationCcw
                    className={`${
                      webIterated ? "text-neon dark:text-neon" : ""
                    }`}
                    size={14}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                created {/* MODIFIED_BLOCK_FOR_WEB_CREATED_START */}
                {web?.created &&
                  (() => {
                    let dateInstance;
                    // Check if web.updated is a string to decide on 'Z' suffix logic
                    if (typeof web.created === "string") {
                      // Append 'Z' if it's a string and doesn't already have 'Z' or a timezone offset
                      if (
                        !web.created.endsWith("Z") &&
                        !/[+-]\d{2}(:?\d{2})?$/.test(web.created)
                      ) {
                        dateInstance = new Date(web.created + "Z");
                      } else {
                        dateInstance = new Date(web.created);
                      }
                    } else {
                      // If web.updated is a number (timestamp) or already a Date object
                      dateInstance = new Date(web.created);
                    }

                    // Check if the parsed date is valid
                    if (isNaN(dateInstance.getTime())) {
                      dateInstance = new Date(); // Fallback to today if parsing failed
                    }
                    return formatDistanceToNow(dateInstance, {
                      addSuffix: true,
                    });
                  })()}
                {/* MODIFIED_BLOCK_FOR_WEB_CREATED_END */}
              </p>
            </div>
          </div>
        </div>
      </Card>
      <IterateModal
        web={web}
        open={showIterateModal}
        setIsOpen={setShowIterateModal}
      />
      <AuthModal open={authModalOpen} setOpen={setAuthModalOpen} />
    </div>
  );
}
