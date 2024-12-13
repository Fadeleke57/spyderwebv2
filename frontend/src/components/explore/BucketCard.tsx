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
import { IterationCcw, ArrowBigUpDash, EllipsisIcon } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useLikeBucket, useUnlikeBucket } from "@/hooks/buckets";
import UserAvatar from "../utility/UserAvatar";
import { useFetchUserById } from "@/hooks/user";
import { Button } from "../ui/button";

export function BucketCard({ bucket }: { bucket: Bucket }) {
  const [bucketLikedCount, setBucketLikedCount] = React.useState(
    bucket.likes.length
  );
  const { data: bucketOwner, isLoading: bucketOwnerLoading } = useFetchUserById(
    bucket?.userId as string
  );
  const [bucketIterationsCount, setBucketIterationsCount] = React.useState(
    bucket.iterations.length
  );
  const { user } = useUser();
  const { mutateAsync: likeBucket } = useLikeBucket(bucket.bucketId);
  const { mutateAsync: unlikeBucket } = useUnlikeBucket(bucket.bucketId);
  const [bucketLiked, setBucketLiked] = React.useState(
    bucket.likes.includes(user?.id as string)
  );

  const handleLikeBucket = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
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
  const handleBucketSettingsModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  React.useEffect(() => {
    setBucketLiked(bucket.likes.includes(user?.id as string)); //will have to represent as a set to support O(1) operations
    setBucketLikedCount(bucket.likes.length);
    setBucketIterationsCount(bucket.iterations.length);
  }, [bucket, user?.id]);

  return (
    <Link
      href={`/buckets/bucket/${bucket.bucketId}`}
      className="flex flex-col gap-2 hover:cursor-pointer"
    >
      <Card className="w-full relative mx-auto min-h-[210px] border-none hover:bg-muted py-6">
        <div className="absolute top-0 left-0 w-full flex justify-between items-center px-4">
          <div className="flex flex-row items-center">
            <UserAvatar
              userId={bucket?.userId}
              width={20}
              height={20}
              className="w-[25px] h-[25px]"
            />
            <p className="ml-2 text-xs text-slate-500">
              {bucketOwner ? bucketOwner.full_name : "Loading..." }
            </p>
            <p className="ml-2 text-xs text-slate-500 font-semibold">*</p>
            <p className="ml-2 text-xs text-slate-500 font-semibold">
              {formatDistanceToNow(new Date(bucket?.updated), {
                addSuffix: true,
              })}
            </p>
          </div>
          <div>
            <Button
              className="rounded-full bg-transparent hover:bg-slate-200"
              onClick={handleBucketSettingsModal}
            >
              <EllipsisIcon color="black" />
            </Button>
          </div>
        </div>
        <CardHeader className="overflow-hidden">
          <CardTitle className="break-words hover:cursor-pointer text-xl leading-tight hyphens-auto">
            {bucket.name}
          </CardTitle>
          <CardDescription className="hyphens-auto mb-8 max-w-6xl text-slate-600">
            {bucket.description}
          </CardDescription>
        </CardHeader>
        <CardContent />
        <div className="absolute bottom-4 left-6 flex flex-row space-x-2">
          <div className="flex flex-row items-center space-x-1">
            <p
              className={`text-s ${
                bucketLiked ? "text-blue-400" : "text-slate-500"
              }`}
            >
              {bucketLikedCount}
            </p>
            <ArrowBigUpDash
              size={28}
              className={`${bucketLiked ? "text-blue-400" : "text-slate-500"}`}
              onClick={handleLikeBucket}
              strokeWidth={1.4}
            />
          </div>
          <div className="flex flex-row items-center space-x-1">
            <p className="text-s text-slate-500">{bucketIterationsCount}</p>
            <IterationCcw size={20} />
          </div>
        </div>
        <p className="text-xs text-slate-500 absolute bottom-4 right-6">
          {formatDistanceToNow(new Date(bucket.created), { addSuffix: true })}
        </p>
      </Card>
      <div className="h-[1px] w-full bg-slate-200"></div>
    </Link>
  );
}
