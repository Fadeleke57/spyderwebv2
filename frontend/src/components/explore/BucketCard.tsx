import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bucket } from "@/types/bucket";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  IterationCcw,
  ArrowBigUpDash,
  EllipsisIcon,
  Album,
  EyeOff,
  Scroll,
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import {
  useGetAllImagesForBucket,
  useLikeBucket,
  useUnlikeBucket,
} from "@/hooks/buckets";
import UserAvatar from "../utility/UserAvatar";
import { useFetchUserById } from "@/hooks/user";
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

export function BucketCard({ bucket }: { bucket: Bucket }) {
  const [bucketLikedCount, setBucketLikedCount] = React.useState(
    bucket.likes.length
  );

  const { data: bucketOwner, isLoading: bucketOwnerLoading } = useFetchUserById(
    bucket.userId
  );
  const { data: imageUrls, isLoading: imagesLoading } =
    useGetAllImagesForBucket(bucket.bucketId);

  const { data: iteratedFromUser, isLoading: iteratedFromLoading } =
    useFetchUserById(bucket?.iteratedFrom || "");

  const [bucketIterationsCount, setBucketIterationsCount] = React.useState(
    bucket.iterations.length
  );

  const { user } = useUser();

  const { mutateAsync: likeBucket } = useLikeBucket(bucket.bucketId);
  const { mutateAsync: unlikeBucket } = useUnlikeBucket(bucket.bucketId);

  const [bucketLiked, setBucketLiked] = React.useState(
    bucket.likes.includes(user?.id as string)
  );

  const [bucketIterated, _] = React.useState(
    bucket.iterations.includes(user?.id as string)
  );

  const [images, setImages] = React.useState<string[]>([]);

  const [iteratedFrom, setIteratedFrom] = React.useState<any | null>(null);
  const [showIterateModal, setShowIterateModal] = React.useState(false);
  const [authModalOpen, setAuthModalOpen] = React.useState(false);
  const [showImageModal, setShowImageModal] = React.useState(false);

  const handleStopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const handleLikeBucket = (e: React.MouseEvent) => {
    handleStopPropagation(e);
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    if (bucketLiked) {
      unlikeBucket().then((numLikes) => {
        if (numLikes !== undefined && numLikes !== null) {
          setBucketLikedCount(numLikes);
        }
      });
      setBucketLiked(false);
    } else {
      likeBucket().then((numLikes) => {
        if (numLikes !== undefined && numLikes !== null) {
          setBucketLikedCount(numLikes);
        }
      });
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

  React.useEffect(() => {
    setBucketLiked(bucket.likes.includes(user?.id as string));
    setBucketLikedCount(bucket.likes.length);
    setBucketIterationsCount(bucket.iterations.length);

    if (iteratedFromUser) {
      setIteratedFrom(iteratedFromUser);
    }

    if (imageUrls) {
      setImages(imageUrls);
    }
  }, [
    bucket,
    user?.id,
    bucket?.likes,
    bucket?.iterations,
    iteratedFromUser,
    imageUrls,
  ]);

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
            <DropdownMenu modal={true}>
              <DropdownMenuTrigger className="rounded-full hover:bg-slate-300 dark:hover:bg-muted p-2 border-none focus:outline-none text-muted-foreground dark:text-foreground">
                <EllipsisIcon />
              </DropdownMenuTrigger>
              <DropdownMenuContent onClick={handleStopPropagation}>
                <DropdownMenuItem className="cursor-pointer">
                  <Album size={16} className="mr-2"></Album>Save
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <EyeOff size={16} className="mr-2"></EyeOff>Hide
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
          <ScrollArea className="w-full flex flex-row px-4 my-2">
            <div className="flex-1">
              <Image
                height={300}
                width={500}
                src={images[0]}
                alt={bucket.name}
                className="rounded-md w-full border h-auto object-cover"
                unoptimized
                style={{ maxHeight: "1000px" }}
              />
            </div>

            <ScrollBar orientation="horizontal" />
          </ScrollArea>
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
            <ArrowBigUpDash
              size={24}
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
              size={16}
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
