import { useEffect, useRef, useState } from "react";
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
  useGetAllImagesForBucket,
  useLikeBucket,
  useUnlikeBucket,
} from "@/hooks/buckets";
import UserAvatar from "../utility/UserAvatar";
import {
  useFetchUserById,
} from "@/hooks/user";
import { IterateModal } from "../utility/IterateModal";
import { Skeleton } from "../ui/skeleton";
import { AuthModal } from "../auth/AuthModal";
import { PublicUser } from "@/types/user";
import { SkeletonCard } from "../utility/SkeletonCard";

export function SearchResultCard({
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


  const { mutateAsync: likeBucket } = useLikeBucket(bucket.bucketId);
  const { mutateAsync: unlikeBucket } = useUnlikeBucket(bucket.bucketId);

  const handleStopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
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

  if (imagesLoading || bucketOwnerLoading || iteratedFromLoading) {
    return <SkeletonCard />;
  }

  return (
    <Link
      href={`/buckets/bucket/${bucket.bucketId}`}
      className="flex flex-col gap-2 hover:cursor-pointer"
    >
      <Card className="w-full relative mx-auto min-h-[60px] border-none bg-background hover:bg-muted py-6 border-b-2">
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
                    new Date(bucket?.updated ? bucket.updated : ""),
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
            {bucket.name}
          </CardTitle>
          <CardDescription className="hyphens-auto mb-8 max-w-6xl text-sm text-muted-foreground">
            {bucket.description}
          </CardDescription>
        </CardHeader>

        <CardContent />
        <p className="text-xs text-muted-foreground absolute bottom-4 right-6">
          {formatDistanceToNow(new Date(bucket.created), {
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
