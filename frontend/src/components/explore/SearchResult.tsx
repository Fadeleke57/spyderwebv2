import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Web } from "@/types/web";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  useGetAllImagesForWeb,
  useLikeWeb,
  useUnlikeWeb,
} from "@/hooks/webs";
import UserAvatar from "../utility/UserAvatar";
import { useFetchUserById } from "@/hooks/user";
import { IterateModal } from "../utility/IterateModal";
import { Skeleton } from "../ui/skeleton";
import { AuthModal } from "../auth/AuthModal";
import { PublicUser } from "@/types/user";
import { SkeletonCard } from "../utility/SkeletonCard";

export function SearchResultCard({
  web,
  user,
}: {
  web: Web;
  user: PublicUser | null;
}) {
  const [webLikedCount, setWebLikedCount] = useState(web.likes.length);
  const [webSaved, setWebSaved] = useState(false);
  const [webHidden, setWebHidden] = useState(false);
  const [webLiked, setWebLiked] = useState(false);
  const [webIterated, _] = useState(false);

  const { data: webOwner, isLoading: webOwnerLoading } = useFetchUserById(
    web.userId
  );
  const { data: imageUrls, isLoading: imagesLoading } =
    useGetAllImagesForWeb(web.webId);
  const { data: iteratedFromUser, isLoading: iteratedFromLoading } =
    useFetchUserById(web.iteratedFrom || "");
  const [webIterationsCount, setWebIterationsCount] = useState(
    web.iterations.length
  );

  const [images, setImages] = useState<string[]>([]);
  const [iteratedFrom, setIteratedFrom] = useState<any | null>(null);
  const [showIterateModal, setShowIterateModal] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const { mutateAsync: likeWeb } = useLikeWeb(web.webId);
  const { mutateAsync: unlikeWeb } = useUnlikeWeb(web.webId);

  const handleStopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
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
  };

  useEffect(() => {
    setWebLiked(web.likes.includes(user?.id as string));
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

  if (imagesLoading || webOwnerLoading || iteratedFromLoading) {
    return <SkeletonCard />;
  }

  return (
    <Link
      href={`/web/${web.webId}`}
      className="flex flex-col gap-2 hover:cursor-pointer"
    >
      <Card className="w-full relative mx-auto min-h-[60px] border-none bg-background hover:bg-muted py-6 border-b-2">
        <div className="absolute top-0 left-0 w-full flex justify-between items-center px-4">
          <div className="flex flex-row items-center mt-3">
            <UserAvatar
              userId={web?.userId}
              width={20}
              height={20}
              className="w-[25px] h-[25px]"
            />
            <div className="ml-2 text-slate-500 flex flex-col align-center">
              <div className="flex flex-row items-center">
                {webOwnerLoading ? (
                  <Skeleton className="h-3 w-[100px] lg:w-[130px] rounded-xl"></Skeleton>
                ) : (
                  <p className="text-xs text-slate-600 dark:text-foreground font-semibold">
                    {webOwner?.username}
                  </p>
                )}
                <p className="ml-2 text-xs text-slate-600 dark:text-foreground font-semibold">
                  *
                </p>
                <p className="ml-2 text-xs text-slate-600 dark:text-foreground font-semibold">
                  {formatDistanceToNow(
                    new Date(web?.updated ? web.updated : ""),
                    {
                      addSuffix: true,
                    }
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
        <CardHeader className="overflow-hidden mt-1">
          <CardTitle className="break-words hover:cursor-pointer text-md leading-tight hyphens-auto text-foreground">
            {web.name}
          </CardTitle>
          <CardDescription className="hyphens-auto mb-8 max-w-6xl text-sm text-muted-foreground">
            {web.description}
          </CardDescription>
        </CardHeader>

        <CardContent />
        <p className="text-xs text-muted-foreground absolute bottom-4 right-6">
          {formatDistanceToNow(new Date(web.created), {
            addSuffix: true,
          })}
        </p>
      </Card>
      <IterateModal
        web={web}
        open={showIterateModal}
        setIsOpen={setShowIterateModal}
      />
      <AuthModal
        referrer="web"
        type="login"
        open={authModalOpen}
        setOpen={setAuthModalOpen}
      />
    </Link>
  );
}
