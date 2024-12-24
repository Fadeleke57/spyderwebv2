import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Hash } from "lucide-react";
import { Bucket, BucketTag } from "@/types/bucket";
import { useAddTagToBucket } from "@/hooks/buckets";
import { useRemoveTagFromBucket } from "@/hooks/buckets";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useUser } from "@/context/UserContext";
import { tagsList } from "@/types/bucket";

export function TagsPopover({ bucket }: { bucket: Bucket }) {
  const { user } = useUser();
  const {
    mutateAsync: addTagToBucket,
    isPending: tagLoading,
    error,
  } = useAddTagToBucket(bucket?.bucketId);
  const {
    mutateAsync: removeTagFromBucket,
    isPending: removeTagLoading,
    error: removeTagError,
  } = useRemoveTagFromBucket(bucket?.bucketId);

  const [selectedTags, setSelectedTags] = useState<string[]>(
    bucket?.tags || []
  );

  const toggleTag = (tag: string) => {
    if (bucket.userId !== user?.id) {
      return;
    }
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
      removeTagFromBucket(tag);
    } else {
      setSelectedTags([...selectedTags, tag]);
      addTagToBucket(tag);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={"link"} className="rounded-full w-fit -ml-2 px-0 m-0 h-fit bg-transparent">
          <Hash size={16} className="mr-1" />
          Tags
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="right"
        sideOffset={4}
        className={`${bucket?.userId !== user?.id ? "w-40" : "w-80"} p-4`}
      >
        <div className="w-full h-fit rounded-md inline-flex justify-start flex-wrap gap-2">
          {bucket?.userId === user?.id ? (
            tagsList.map((tag: BucketTag) => {
              const isSelected = selectedTags.includes(tag.label);
              return (
                <div
                  key={tag.label}
                  onClick={() => toggleTag(tag.label)}
                  className={`cursor-pointer px-2 py-1 rounded-xl ${
                    isSelected
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-900"
                  } flex items-center space-x-2`}
                >
                  {isSelected && <Check size={16} />}
                  <small>{tag.value}</small>
                </div>
              );
            })
          ) : bucket?.tags.length ? (
            bucket?.tags?.map((tag: string) => (
              <div
                key={tag}
                className="cursor-pointer px-2 py-1 rounded-xl bg-blue-500  text-white flex items-center space-x-2"
              >
                <small>{tag}</small>
              </div>
            ))
          ) : (
            <div>
              <small>No tags</small>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
