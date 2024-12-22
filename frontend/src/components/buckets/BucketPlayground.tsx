import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "../ui/label";
import { CirclePlus, Check, ChevronsUpDown } from "lucide-react";
import { Bucket } from "@/types/bucket";
import { PublicUser } from "@/types/user";
import BucketSearchModal from "./BucketSearchModal";
import BucketGraph from "./BucketGraph";
import { BucketConfigFormValues } from "@/types/article";
import { Source } from "@/types/source";
import { useFetchSourcesForBucket } from "@/hooks/sources";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import BucketDataDrawer from "./BucketDataDrawer";
import { setDefaultResultOrder } from "dns";
import { set } from "lodash";

function BucketPlayground({
  bucket,
  user,
  refetch,
}: {
  bucket: Bucket;
  user: PublicUser | null;
  refetch: () => void;
}) {
  const isOwner = user && user?.id === bucket?.userId;
  const [config, setConfig] = useState<BucketConfigFormValues>({
    title: bucket?.name || "",
    description: bucket?.description || "",
  });
  const [selectedSourceId, setSelectedSourceId] = useState<string>("");
  const {
    data: sources,
    isLoading,
    error: sourcesError,
    refetch: refetchSources,
  } = useFetchSourcesForBucket(bucket?.bucketId);
  const [fetchedSources, setFetchedSources] = useState<Source[]>([]);
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [isBucketDataDrawerOpen, setIsBucketDataDrawerOpen] = useState(false);

  const handleSourceClick = (sourceId: string) => {
    console.log("sourceId", sourceId);
    console.log("drawer open", isBucketDataDrawerOpen);
    setSelectedSourceId(sourceId);
    console.log("selectedSourceId", selectedSourceId);
    setIsBucketDataDrawerOpen(true);
    setOpen(false);
    console.log("drawer open", isBucketDataDrawerOpen);
  };

  return (
    <div className="relative flex h-full min-h-[50vh] flex-col rounded-xl bg-muted/50 lg:col-span-2">
      <Badge variant="outline" className="absolute right-3 top-3">
        {bucket?.sourceIds?.length || 0} sources added
      </Badge>
      {isOwner &&
      (bucket?.sourceIds?.length === undefined ||
        bucket?.sourceIds?.length === null ||
        bucket?.sourceIds?.length > 0) ? (
        <div className="absolute right-3 top-8">
          <div className="flex flex-col gap-2 whitespace-nowrap mt-2 justify-center">
            {" "}
            <BucketSearchModal
              config={config}
              setConfig={setConfig}
              bucket={bucket}
              refreshSources={refetchSources}
              refreshBucket={refetch}
              view="default"
            >
              <Button className="rounded-full">
                <CirclePlus className="size-4 mr-2" />
                File
              </Button>
            </BucketSearchModal>
            <BucketSearchModal
              config={config}
              setConfig={setConfig}
              bucket={bucket}
              refreshSources={refetchSources}
              refreshBucket={refetch}
              view="website"
            >
              <Button className="bg-blue-500 hover:bg-blue-600 rounded-full">
                <CirclePlus className="size-4 mr-2" />
                Website
              </Button>
            </BucketSearchModal>
            <BucketSearchModal
              config={config}
              setConfig={setConfig}
              bucket={bucket}
              refreshSources={refetchSources}
              refreshBucket={refetch}
              view="youtube"
            >
              <Button className="bg-red-500 hover:bg-red-600 rounded-full">
                <CirclePlus className="size-4 mr-2" />
                YouTube
              </Button>
            </BucketSearchModal>
            <BucketSearchModal
              config={config}
              setConfig={setConfig}
              bucket={bucket}
              refreshSources={refetchSources}
              refreshBucket={refetch}
              view="note"
            >
              <Button className="bg-green-500 hover:bg-green-600 rounded-full">
                <CirclePlus className="size-4 mr-2" />
                Note
              </Button>
            </BucketSearchModal>
          </div>
        </div>
      ) : null}
      {isOwner && bucket?.sourceIds?.length === 0 && (
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/4 flex flex-col items-center gap-1 text-center min-w-[300px]">
          <h3 className="text-2xl font-bold tracking-tight">
            Add your first source
          </h3>
          <p className="text-sm text-muted-foreground">
            Start collecting data to add your mind map here.
          </p>
          <div className="flex flex-wrap gap-2 whitespace-nowrap mt-2 justify-center">
            {" "}
            <BucketSearchModal
              config={config}
              setConfig={setConfig}
              bucket={bucket}
              refreshSources={refetchSources}
              refreshBucket={refetch}
              view="default"
            >
              <Button className="rounded-full">
                <CirclePlus className="size-4 mr-2" />
                Upload File
              </Button>
            </BucketSearchModal>
            <BucketSearchModal
              config={config}
              setConfig={setConfig}
              bucket={bucket}
              refreshSources={refetchSources}
              refreshBucket={refetch}
              view="website"
            >
              <Button className="bg-blue-500 hover:bg-blue-600 rounded-full">
                <CirclePlus className="size-4 mr-2" />
                Add Website
              </Button>
            </BucketSearchModal>
            <BucketSearchModal
              config={config}
              setConfig={setConfig}
              bucket={bucket}
              refreshSources={refetchSources}
              refreshBucket={refetch}
              view="youtube"
            >
              <Button className="bg-red-500 hover:bg-red-600 rounded-full">
                <CirclePlus className="size-4 mr-2" />
                <span>Add YouTube Video</span>
              </Button>
            </BucketSearchModal>
            <BucketSearchModal
              config={config}
              setConfig={setConfig}
              bucket={bucket}
              refreshSources={refetchSources}
              refreshBucket={refetch}
              view="note"
            >
              <Button className="bg-green-500 hover:bg-green-600 rounded-full">
                <CirclePlus className="size-4 mr-2" />
                Add Note
              </Button>
            </BucketSearchModal>
          </div>
        </div>
      )}
      <div className="flex-1" />
      <BucketGraph
        setConfig={setConfig}
        bucketId={bucket?.bucketId}
        hasSources={bucket?.sourceIds?.length ? true : false}
        fetchedSources={fetchedSources}
        setFetchedSources={setFetchedSources}
        selectedSourceId={selectedSourceId}
        setSelectedSourceId={setSelectedSourceId}
      />
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 right-0 w-[90%]">
        <Label htmlFor="comments" className="sr-only">
          Comment
        </Label>
        <p
          id="comments"
          className=" resize-none border-0 p-4 shadow-none focus-visible:ring-0"
        ></p>
        <div className="flex w-full flex-col pt-0">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full h-16 justify-between"
              >
                Find sources...
                <ChevronsUpDown className="opacity-50" />
              </Button>
            </PopoverTrigger>

            <PopoverContent>
              <Command>
                <CommandInput placeholder="Search sources..." />
                <CommandList>
                  <CommandEmpty>
                    No sources found. <span>Create one?</span>
                  </CommandEmpty>
                  <CommandGroup>
                    {sources?.map((source: Source, id: number) => (
                      <CommandItem
                        key={id}
                        className="cursor-pointer"
                        onSelect={() => handleSourceClick(source.sourceId)}
                      >
                        {source.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      {isBucketDataDrawerOpen && selectedSourceId && bucket?.bucketId && (
        <BucketDataDrawer
          open={isBucketDataDrawerOpen}
          setOpen={setIsBucketDataDrawerOpen}
          sourceId={selectedSourceId}
          bucketId={bucket.bucketId}
        />
      )}
    </div>
  );
}

export default BucketPlayground;
