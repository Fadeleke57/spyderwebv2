import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Label } from "../ui/label";
import { ChevronsUpDown, Link, File, Notebook, Youtube } from "lucide-react";
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
import BucketDataDrawer from "./BucketDataDrawer";

import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DialogTrigger } from "../ui/dialog";

function BucketPlayground({
  bucket,
  user,
  refetch,
}: {
  bucket: Bucket;
  user: PublicUser | null;
  refetch: () => void;
}) {
  const [config, setConfig] = useState<BucketConfigFormValues>({
    title: bucket?.name || "",
    description: bucket?.description || "",
  });

  const {
    data: sources,
    isLoading,
    error: sourcesError,
    refetch: refetchSources,
  } = useFetchSourcesForBucket(bucket?.bucketId);

  const isOwner = user && user?.id === bucket?.userId;
  const [selectedSourceId, setSelectedSourceId] = useState<string>("");
  const [fetchedSources, setFetchedSources] = useState<Source[]>([]);
  const [open, setOpen] = React.useState(false);
  const [isBucketDataDrawerOpen, setIsBucketDataDrawerOpen] = useState(false);
  const [isBucketSearchModalOpen, setIsBucketSearchModalOpen] = useState(false);
  const [bucketSearchModalView, setBucketSearchModalView] = useState<
    "youtube" | "website" | "default" | "note"
  >("default");

  const handleSourceClick = (sourceId: string) => {
    setSelectedSourceId(sourceId);
    setIsBucketDataDrawerOpen(true);
    setOpen(false);
  };

  const handleDropdownButtonClick = (
    view: "youtube" | "website" | "default" | "note"
  ) => {
    setBucketSearchModalView(view);
    setIsBucketSearchModalOpen(true);
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
        <div className="absolute right-3 top-10">
          <BucketSearchModal
            open={isBucketSearchModalOpen}
            setOpen={setIsBucketSearchModalOpen}
            bucket={bucket}
            config={config}
            setConfig={setConfig}
            refreshSources={refetchSources}
            refreshBucket={refetch}
            view={bucketSearchModalView}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="rounded-full h-8">
                  <PlusCircle size={16} className="mr-2" />
                  Add
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="left"
                sideOffset={5}
                className="w-40 right-0"
              >
                <DropdownMenuGroup>
                  <DialogTrigger
                    asChild
                    onClick={() => handleDropdownButtonClick("website")}
                  >
                    <DropdownMenuItem className="cursor-pointer">
                      <Link size={16} className="mr-2" />
                      <span>Website</span>
                      {/*<DropdownMenuShortcut>⌘K</DropdownMenuShortcut>*/}
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DialogTrigger
                    asChild
                    onClick={() => handleDropdownButtonClick("default")}
                  >
                    <DropdownMenuItem className="cursor-pointer">
                      <File size={16} className="mr-2" />
                      <span>File</span>
                      {/*<DropdownMenuShortcut>⌘K</DropdownMenuShortcut>*/}
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DialogTrigger
                    asChild
                    onClick={() => handleDropdownButtonClick("note")}
                  >
                    <DropdownMenuItem className="cursor-pointer">
                      <Notebook size={16} className="mr-2" />
                      <span>Note</span>
                      {/*<DropdownMenuShortcut>⌘K</DropdownMenuShortcut>*/}
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DialogTrigger
                    asChild
                    onClick={() => handleDropdownButtonClick("youtube")}
                  >
                    <DropdownMenuItem className="cursor-pointer">
                      <Youtube size={16} className="mr-2" />
                      <span>Youtube</span>
                      {/*<DropdownMenuShortcut>⌘K</DropdownMenuShortcut>*/}
                    </DropdownMenuItem>
                  </DialogTrigger>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </BucketSearchModal>
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
              open={isBucketSearchModalOpen}
              setOpen={setIsBucketSearchModalOpen}
              bucket={bucket}
              config={config}
              setConfig={setConfig}
              refreshSources={refetchSources}
              refreshBucket={refetch}
              view={bucketSearchModalView}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="rounded-full h-8">
                    <PlusCircle size={16} className="mr-2" />
                    Create
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="bottom"
                  sideOffset={5}
                  className="w-40 right-0"
                >
                  <DropdownMenuGroup>
                    <DialogTrigger
                      asChild
                      onClick={() => handleDropdownButtonClick("website")}
                    >
                      <DropdownMenuItem className="cursor-pointer">
                        <Link size={16} className="mr-2" />
                        <span>Website</span>
                        {/*<DropdownMenuShortcut>⌘K</DropdownMenuShortcut>*/}
                      </DropdownMenuItem>
                    </DialogTrigger>
                    <DialogTrigger
                      asChild
                      onClick={() => handleDropdownButtonClick("default")}
                    >
                      <DropdownMenuItem className="cursor-pointer">
                        <File size={16} className="mr-2" />
                        <span>File</span>
                        {/*<DropdownMenuShortcut>⌘K</DropdownMenuShortcut>*/}
                      </DropdownMenuItem>
                    </DialogTrigger>
                    <DialogTrigger
                      asChild
                      onClick={() => handleDropdownButtonClick("note")}
                    >
                      <DropdownMenuItem className="cursor-pointer">
                        <Notebook size={16} className="mr-2" />
                        <span>Note</span>
                        {/*<DropdownMenuShortcut>⌘K</DropdownMenuShortcut>*/}
                      </DropdownMenuItem>
                    </DialogTrigger>
                    <DialogTrigger
                      asChild
                      onClick={() => handleDropdownButtonClick("youtube")}
                    >
                      <DropdownMenuItem className="cursor-pointer">
                        <Youtube size={16} className="mr-2" />
                        <span>Youtube</span>
                        {/*<DropdownMenuShortcut>⌘K</DropdownMenuShortcut>*/}
                      </DropdownMenuItem>
                    </DialogTrigger>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
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
