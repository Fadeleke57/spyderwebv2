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
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useLikeBucket, useUnlikeBucket } from "@/hooks/buckets";
import UserAvatar from "../utility/UserAvatar";
import { useFetchUserById } from "@/hooks/user";
import { IterateModal } from "../utility/IterateModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Separator } from "../ui/separator";

export function BucketCard({ bucket }: { bucket: Bucket }) {
  const [bucketLikedCount, setBucketLikedCount] = React.useState(
    bucket.likes.length
  );
  const { data: bucketOwner, isLoading: bucketOwnerLoading } = useFetchUserById(
    bucket?.userId as string
  );
  const { data: iteratedFromUser, isLoading: iteratedFromLoading } =
    useFetchUserById(bucket?.iteratedFrom ? bucket?.iteratedFrom : "");

  const [bucketIterationsCount, setBucketIterationsCount] = React.useState(
    bucket.iterations.length
  );
  const { user } = useUser();
  const { mutateAsync: likeBucket } = useLikeBucket(bucket.bucketId);
  const { mutateAsync: unlikeBucket } = useUnlikeBucket(bucket.bucketId);
  const [bucketLiked, setBucketLiked] = React.useState(
    bucket.likes.includes(user?.id as string)
  );
  const [bucketIterated, setBucketIterated] = React.useState(
    bucket.iterations.includes(user?.id as string)
  );
  const [showIterateModal, setShowIterateModal] = React.useState(false);

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

  const handleIterateBucket = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (bucketIterated) {
      return;
    }
    setShowIterateModal(true);
  };

  const handleStopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  React.useEffect(() => {
    setBucketLiked(bucket.likes.includes(user?.id as string));
    setBucketLikedCount(bucket.likes.length);
    setBucketIterationsCount(bucket.iterations.length);
  }, [bucket, user?.id]);

  return (
    <Link
      href={`/buckets/bucket/${bucket.bucketId}`}
      className="flex flex-col gap-2 hover:cursor-pointer"
    >
      <Card className="w-full relative mx-auto min-h-[210px] border-none hover:bg-muted py-6 border-b-2">
        <div className="absolute top-0 left-0 w-full flex justify-between items-center px-4">
          <div className="flex flex-row items-center">
            <UserAvatar
              userId={bucket?.userId}
              width={20}
              height={20}
              className="w-[25px] h-[25px]"
            />
            <div className="ml-2 text-slate-500 flex flex-col align-center">
              <div className="flex flex-row items-center">
                <p className="text-xs text-slate-600 font-semibold">
                  {bucketOwner?.full_name}
                </p>
                <p className="ml-2 text-xs ">*</p>
                <p className="ml-2 text-xs">
                  {formatDistanceToNow(
                    new Date(bucket?.updated ? bucket.updated + "Z" : ""),
                    {
                      addSuffix: true,
                    }
                  )}
                </p>
              </div>
              <div className="">
                {bucket?.iteratedFrom ? (
                  <p className="text-xs font-normal">
                    Iterated From{" "}
                    <span className="font-semibold text-blue-500">
                      @{iteratedFromUser?.full_name}
                    </span>
                  </p>
                ) : (
                  ""
                )}
              </div>
            </div>
          </div>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger className="rounded-full p-2 hover:bg-slate-300 border-none focus:outline-none">
                <EllipsisIcon />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={handleStopPropagation}
                >
                  <Album size={16} className="mr-2"></Album>Save
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={handleStopPropagation}
                >
                  <EyeOff size={16} className="mr-2"></EyeOff>Hide
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
            <p
              className={`text-s ${
                bucketIterated ? "text-blue-400" : "text-slate-500"
              }`}
            >
              {bucketIterationsCount}
            </p>
            <IterationCcw
              className={`${
                bucketIterated ? "text-blue-400" : "text-slate-500"
              }`}
              size={20}
              onClick={handleIterateBucket}
            />
          </div>
        </div>
        <p className="text-xs text-slate-500 absolute bottom-4 right-6">
          {formatDistanceToNow(new Date(bucket.created + "Z"), {
            addSuffix: true,
          })}
        </p>
      </Card>
      {showIterateModal && (
        <IterateModal
          bucket={bucket}
          open={showIterateModal}
          setIsOpen={setShowIterateModal}
        />
      )}
    </Link>
  );
}
