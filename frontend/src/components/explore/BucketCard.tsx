import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bucket } from "@/types/bucket";
import { formatText } from "@/lib/utils";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Heart, IterationCcw, BookMarked } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useLikeBucket, useUnlikeBucket } from "@/hooks/buckets";
import LoginModal from "../utility/LoginModal";
import { Skeleton } from "../ui/skeleton";

export function BucketCard({ bucket }: { bucket: Bucket}) {
  const [bucketLikedCount, setBucketLikedCount] = React.useState(
    bucket.likes.length
  );
  const [bucketIterationsCount, setBucketIterationsCount] = React.useState(
    bucket.iterations.length
  );
  const { user } = useUser();
  const { likeBucket } = useLikeBucket(bucket.bucketId);
  const { unlikeBucket } = useUnlikeBucket(bucket.bucketId);
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

  React.useEffect(() => {
    setBucketLiked(bucket.likes.includes(user?.id as string));
    setBucketLikedCount(bucket.likes.length);
    setBucketIterationsCount(bucket.iterations.length);
  }, [bucket, user?.id]);

  return (
    <Link href={`/buckets/bucket/${bucket.bucketId}`}>
      <Card className="min-w-[330px] lg:w-[350px] h-[250px] relative mx-auto">
        <CardHeader className="overflow-hidden">
          <CardTitle className="break-words hover:cursor-pointer hover:text-blue-500">
            <h3 className="hyphens-auto">{formatText(bucket.name, 50)}</h3>
          </CardTitle>
          <CardDescription className="hyphens-auto">
            {formatText(bucket.description, 140)}
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
            <BookMarked
              size={20}
              className={`${bucketLiked ? "text-blue-400" : "text-slate-500"}`}
              onClick={handleLikeBucket}
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
    </Link>
  );
}
