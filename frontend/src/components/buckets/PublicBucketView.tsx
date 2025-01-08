import React from "react";
import { Bucket } from "@/types/bucket";
import { useGetAllImagesForBucket } from "@/hooks/buckets";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import Image from "next/image";

function PublicBucketView({ bucket }: { bucket: Bucket }) {
  const { data: imageUrls, isLoading: imagesLoading } =
    useGetAllImagesForBucket(bucket.bucketId);
  const [images, setImages] = React.useState<string[]>([]);
  console.log(imageUrls)
  React.useEffect(() => {
    if (imageUrls) {
      setImages(imageUrls);
    }
  }, [bucket, imageUrls, images]);

  return (
    <div className="grid w-full items-start gap-6">
      <div className="grid gap-6 rounded-lg pb-8 pt-4 px-4">
        <div>
          <div className="flex flex-col space-y-2">
            <small className="text-sm font-medium leading-none text-blue-500 dark:text-blue-400">
              {bucket?.visibility === "Private" ? "Private" : "Public"}
            </small>
            <span id="name" className="text-xl font-semibold">
              {bucket?.name || "Untitled"}
            </span>
            <span className="text-sm text-muted-foreground">
              {bucket?.description || "No description"}
            </span>
          </div>
        </div>
      </div>
      {images.length > 0 && (
        <ScrollArea className="w-full flex flex-row px-4 my-2">
          {images && images.map((image: string, index: number) => (
            <div key={index} className="flex-1">
              <Image
                height={300}
                width={500}
                src={image}
                alt={bucket.name}
                className="rounded-md w-full border h-auto object-cover"
                style={{ maxHeight: "400px" }}
                unoptimized
              />
            </div>
          ))}

          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
    </div>
  );
}

export default PublicBucketView;
