import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bucket } from "@/types/bucket";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  IterationCcw,
  ArrowBigUpDash,
  EllipsisIcon,
  EyeOff,
  Bookmark,
  Star,
} from "lucide-react";
import {
  useGetAllImagesForBucket,
  useLikeBucket,
  useUnlikeBucket,
} from "@/hooks/buckets";
import UserAvatar from "../utility/UserAvatar";
import {
  useFetchUserById,
  useHideBucket,
  useSaveBucket,
  useUnsaveBucket,
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
import { ImageModal } from "./ImageModal";

export function BucketCard({
  bucket,
  user,
}: {
  bucket: Bucket;
  user: PublicUser | null;
}) {
  const [bucketLikedCount, setBucketLikedCount] = useState(bucket.likes.length);
  const [bucketSaved, setBucketSaved] = useState(false);
  const [bucketHidden, setBucketHidden] = useState(false);
  const [bucketLiked, setBucketLiked] = useState(false);
  const [bucketIterated, _] = useState(false);

  const { data: bucketOwner, isLoading: bucketOwnerLoading } = useFetchUserById(
    bucket.userId
  );
  const { data: imageUrls, isLoading: imagesLoading } =
    useGetAllImagesForBucket(bucket.bucketId);
  const { data: iteratedFromUser, isLoading: iteratedFromLoading } =
    useFetchUserById(bucket.iteratedFrom || "");
  const [bucketIterationsCount, setBucketIterationsCount] = useState(
    bucket.iterations.length
  );

  const [images, setImages] = useState<string[]>([]);
  const [iteratedFrom, setIteratedFrom] = useState<any | null>(null);
  const [showIterateModal, setShowIterateModal] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");

  const { mutateAsync: likeBucket } = useLikeBucket(bucket.bucketId);
  const { mutateAsync: unlikeBucket } = useUnlikeBucket(bucket.bucketId);
  const { mutateAsync: hideBucket } = useHideBucket(bucket.bucketId);
  const { mutateAsync: saveBucket } = useSaveBucket(bucket.bucketId);
  const { mutateAsync: unsaveBucket } = useUnsaveBucket(bucket.bucketId);

  const handleStopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const handleHideBucket = async (e: React.MouseEvent) => {
    handleStopPropagation(e);
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    setBucketHidden(true);
    await hideBucket();
  };

  const handleUnhideBucket = async (e: React.MouseEvent) => {
    handleStopPropagation(e);
    setBucketHidden(false);
    await hideBucket();
  };

  const handleSaveBucket = async (e: React.MouseEvent) => {
    handleStopPropagation(e);
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    if (bucketSaved) {
      await unsaveBucket();
      setBucketSaved(false);
    } else {
      await saveBucket();
      setBucketSaved(true);
    }
  };

  const handleLikeBucket = async (e: React.MouseEvent) => {
    handleStopPropagation(e);
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    if (bucketLiked) {
      const numLikes = await unlikeBucket();
      if (numLikes !== undefined && numLikes !== null) {
        setBucketLikedCount(numLikes);
      }
      setBucketLiked(false);
    } else {
      const numLikes = await likeBucket();
      if (numLikes !== undefined && numLikes !== null) {
        setBucketLikedCount(numLikes);
      }
      setBucketLiked(true);
    }
  };

  const handleIterateBucket = (e: React.MouseEvent) => {
    handleStopPropagation(e);
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    if (bucketIterated || bucket.iterations.includes(user?.id || "")) {
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
    setBucketLiked(bucket.likes.includes(user?.id as string));
    setBucketLikedCount(bucket.likes.length);
    setBucketIterationsCount(bucket.iterations.length);
  
    if (user) {
      setBucketSaved(user.bucketsSaved?.includes(bucket.bucketId) || false);
      setBucketHidden(user.bucketsHidden?.includes(bucket.bucketId) || false);
    }

    if (iteratedFromUser) {
      setIteratedFrom(iteratedFromUser);
    }

    if (imageUrls) {
      setImages(imageUrls);
    }
  }, [bucket, user, iteratedFromUser, imageUrls]);

  if (user && user.bucketsHidden.includes(bucket.bucketId)) {
    return null;
  }

  if (bucketHidden) {
    return (
      <Card className="w-full relative mx-auto min-h-[60px] border-none bg-background hover:bg-muted py-2 border-b-2">
        <div className="flex items-center justify-between px-6">
          <p className="text-sm text-muted-foreground">
            Bucket hidden successfully
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUnhideBucket}
            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-500"
          >
            Undo
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Link
      href={`/buckets/bucket/${bucket.bucketId}`}
      className="flex flex-col gap-2 hover:cursor-pointer"
    >
      <Card className="w-full relative mx-auto min-h-[120px] border-none bg-background hover:bg-muted py-6 border-b-2">
        <div className="absolute top-0 left-0 w-full flex justify-between items-center px-4">
          <div className="flex flex-row items-center mt-3">
            <UserAvatar
              userId={bucket?.userId}
              width={20}
              height={20}
              className="w-[25px] h-[25px]"
            />
            <div className="ml-2 text-slate-500 flex flex-col align-center">
              <div className="flex flex-row items-center">
                {bucketOwnerLoading ? (
                  <Skeleton className="h-3 w-[100px] lg:w-[130px] rounded-xl"></Skeleton>
                ) : (
                  <p className="text-xs text-slate-600 dark:text-foreground font-semibold">
                    {bucketOwner?.username}
                  </p>
                )}
                <p className="ml-2 text-xs text-slate-600 dark:text-foreground font-semibold">
                  *
                </p>
                <p className="ml-2 text-xs text-slate-600 dark:text-foreground font-semibold">
                  {formatDistanceToNow(
                    new Date(bucket?.updated ? bucket.updated + "Z" : ""),
                    {
                      addSuffix: true,
                    }
                  )}
                </p>
              </div>
              <div className="">
                {iteratedFrom ? (
                  <p className="text-xs text-muted-foreground font-normal">
                    Iterated From{" "}
                    <span className="font-semibold text-blue-500 dark:text-blue-400">
                      @{iteratedFrom.username}
                    </span>
                  </p>
                ) : bucket.iteratedFrom ? (
                  <Skeleton className="h-3 w-[100px] lg:w-[130px] rounded-xl"></Skeleton>
                ) : null}
              </div>
            </div>
          </div>
          <div>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger className="rounded-full hover:bg-slate-300 dark:hover:bg-muted p-2 border-none focus:outline-none text-muted-foreground dark:text-foreground">
                <EllipsisIcon onClick={handleStopPropagation} />
              </DropdownMenuTrigger>
              <DropdownMenuContent onClick={handleStopPropagation}>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={handleSaveBucket}
                >
                  <Bookmark
                    size={16}
                    className={`mr-2 ${bucketSaved && "fill-foreground"}`}
                  />
                  {bucketSaved ? "Unsave" : "Save"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={handleHideBucket}
                >
                  <EyeOff size={16} className="mr-2" />
                  Hide
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <CardHeader className="overflow-hidden mt-3">
          <CardTitle className="break-words hover:cursor-pointer text-lg leading-tight hyphens-auto text-foreground">
            {bucket.name}
          </CardTitle>
          <CardDescription className="hyphens-auto mb-8 max-w-6xl text-muted-foreground">
            {bucket.description}
          </CardDescription>
        </CardHeader>

        {images.length > 0 && (
          <>
            <ScrollArea className="w-full flex flex-row px-4 my-2">
              <div className="flex-1">
                <Image
                  height={300}
                  width={500}
                  src={images[0]}
                  alt={bucket.name}
                  className="rounded-md w-full border h-auto object-cover"
                  unoptimized
                  onClick={(e) => handleImageClick(e, images[0])}
                  style={{ maxHeight: "1000px" }}
                />
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
            <ImageModal
              isOpen={showImageModal}
              setIsOpen={setShowImageModal}
              onClose={() => setShowImageModal(false)}
              imageUrl={selectedImage}
              title={bucket.name}
              description={bucket.description}
            />
          </>
        )}

        <CardContent />
        <div className="absolute bottom-4 left-6 flex flex-row space-x-2">
          <div className="flex flex-row items-center space-x-1">
            <p
              className={`text-sm ${
                bucketLiked
                  ? "text-blue-500 dark:text-blue-400"
                  : "text-muted-foreground"
              }`}
            >
              {bucketLikedCount}
            </p>
            <Star
              size={16}
              className={`${
                bucketLiked
                  ? "text-blue-500 dark:text-blue-400"
                  : "text-muted-foreground hover:text-blue-500 dark:hover:text-blue-400"
              } ${bucketLiked ? "fill-blue-500 dark:fill-blue-400" : "none"}`}
              onClick={handleLikeBucket}
              strokeWidth={1.4}
            />
          </div>
          <div className="flex flex-row items-center space-x-1">
            <p
              className={`text-sm ${
                bucketIterated
                  ? "text-blue-500 dark:text-blue-400"
                  : "text-muted-foreground"
              }`}
            >
              {bucketIterationsCount}
            </p>
            <IterationCcw
              className={`${
                bucketIterated
                  ? "text-blue-500 dark:text-blue-400"
                  : "text-muted-foreground hover:text-blue-500 dark:hover:text-blue-400"
              }`}
              size={14}
              onClick={handleIterateBucket}
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground absolute bottom-4 right-6">
          {formatDistanceToNow(new Date(bucket.created + "Z"), {
            addSuffix: true,
          })}
        </p>
      </Card>
      <IterateModal
        bucket={bucket}
        open={showIterateModal}
        setIsOpen={setShowIterateModal}
      />
      <AuthModal
        referrer="bucket"
        type="login"
        open={authModalOpen}
        setOpen={setAuthModalOpen}
      />
    </Link>
  );
}
