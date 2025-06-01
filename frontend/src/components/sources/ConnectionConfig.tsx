import {
  useFetchIncomingConnections,
  useFetchOutgoingConnections,
} from "@/hooks/connections";
import { useFetchSourcesForWeb } from "@/hooks/sources";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import ConnectionBlock from "./ConnectionBlock";
import CreateConnectionBlock from "./CreateConnectionBlock";
import { mapSourceToIcon } from "../utility/Icons";
import { Source } from "@/types/source";
import { CirclePlus } from "lucide-react";
import { Connection } from "@/types/connection";
import { ScrollArea } from "../ui/scroll-area";
import { Skeleton } from "../ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useSourceStore } from "@/store/sourceStore";
import { useRouter } from "next/router";

function ConnectionsConfig({ isOwner }: { isOwner: boolean }) {
  const router = useRouter();
  const { webId } = router.query;
  const { selectedSourceId: sourceId } = useSourceStore();
  const {
    data: outgoingConnections,
    isLoading: isLoadingOutgoingConnections,
    refetch: refetchOutgoingConnections,
  } = useFetchOutgoingConnections(webId as string, sourceId);
  const {
    data: incomingConnections,
    isLoading: isLoadingIncomingConnections,
    refetch: refetchIncomingConnections,
  } = useFetchIncomingConnections(webId as string, sourceId);
  const {
    data: allSources,
    isLoading: isLoadingAllSources,
    refetch: refetchOtherSources,
  } = useFetchSourcesForWeb(webId as string);

  const handleConnectionBlockDelete = () => {
    refetchOutgoingConnections();
    refetchIncomingConnections();
  };

  const [sourcePopoverOpen, setSourcePopoverOpen] = useState(false);
  const [sourceIdToLink, setSourceIdToLink] = useState<string>("");
  const [connectionPlaceHolderVisible, setConnectionPlaceHolderVisible] =
    useState(false);
  const [fetchedOutgoingConnections, setFetchedOutgoingConnections] = useState<
    Connection[]
  >([]);
  const [fetchedIncomingConnections, setFetchedIncomingConnections] = useState<
    Connection[]
  >([]);
  const [otherSources, setOtherSources] = useState<Source[]>([]);
  const [activeTab, setActiveTab] = useState("outgoing");

  useEffect(() => {
    if (allSources) {
      setOtherSources(
        allSources.filter((src: Source) => src.sourceId !== sourceId)
      );
    }
  }, [allSources, sourceId]);

  const handleSelectToSource = (src: string) => {
    setSourceIdToLink(src);
    setSourcePopoverOpen(false);
    setActiveTab("outgoing");
    setConnectionPlaceHolderVisible(true);
  };

  useEffect(() => {
    if (outgoingConnections) {
      setFetchedOutgoingConnections(outgoingConnections);
    }
    if (incomingConnections) {
      setFetchedIncomingConnections(incomingConnections);
    }
  }, [outgoingConnections, incomingConnections, sourceId]);

  return (
    <ScrollArea className="border rounded-lg p-4 flex flex-col hidden lg:block h-[calc(100vh-160px)]">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-mono text-sm">
          {isLoadingOutgoingConnections ||
            (isLoadingIncomingConnections && null)}
          {fetchedIncomingConnections.length +
            fetchedOutgoingConnections.length >
          0
            ? `${fetchedIncomingConnections.length + fetchedOutgoingConnections.length} connection${fetchedIncomingConnections.length + fetchedOutgoingConnections.length > 1 ? "s" : ""}`
            : "No connections found."}
          {isOwner && (
            <Popover
              open={sourcePopoverOpen}
              onOpenChange={setSourcePopoverOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="link"
                  className="p-0 ml-2 w-fit text-violet-400 hover:underline"
                >
                  Create One? <CirclePlus size={16} className="ml-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[500px]">
                <Command>
                  <CommandInput placeholder="Search sources..." />
                  <CommandList className="no-scroll-bg">
                    <CommandEmpty>No sources found.</CommandEmpty>
                    <CommandGroup>
                      {otherSources?.map((otherSource: Source, id: number) => (
                        <CommandItem
                          key={otherSource.sourceId}
                          className="cursor-pointer items-start wrap"
                          onSelect={() =>
                            handleSelectToSource(otherSource.sourceId)
                          }
                          value={otherSource.name + id.toString()}
                        >
                          {mapSourceToIcon(otherSource.type, 16)}
                          {otherSource.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
        </h4>
      </div>

      <Tabs
        value={activeTab}
        defaultValue={"outgoing"}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="w-full grid grid-cols-2 mb-4">
          <TabsTrigger value="outgoing" className="font-mono">
            Outgoing ({fetchedOutgoingConnections.length})
          </TabsTrigger>
          <TabsTrigger value="incoming" className="font-mono">
            Incoming ({fetchedIncomingConnections.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="outgoing" className="space-y-2 font-mono">
          {isLoadingOutgoingConnections ? (
            <Skeleton className="h-16 w-full rounded-xl" />
          ) : (
            <>
              {fetchedOutgoingConnections.length === 0 &&
                !connectionPlaceHolderVisible && (
                  <span className="text-sm text-muted-foreground font-mono">
                    Nothing yet.
                  </span>
                )}
              {connectionPlaceHolderVisible && sourceIdToLink && (
                <CreateConnectionBlock
                  fromSourceId={sourceId}
                  toSourceId={sourceIdToLink}
                  webId={webId as string}
                  setCreateConnectionVisible={setConnectionPlaceHolderVisible}
                  onConnectionCreated={refetchOutgoingConnections}
                />
              )}
              {fetchedOutgoingConnections.map(
                (connection: Connection, id: number) => (
                  <ConnectionBlock
                    key={id}
                    connection={connection}
                    type="out"
                    isOwner={isOwner}
                    onConnectionDeleted={handleConnectionBlockDelete}
                  />
                )
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="incoming" className="space-y-2">
          {isLoadingIncomingConnections ? (
            <Skeleton className="h-16 w-full rounded-xl" />
          ) : !incomingConnections?.length ? (
            <span className="text-sm text-muted-foreground font-mono">
              Nothing yet.
            </span>
          ) : (
            incomingConnections?.map((connection: Connection, id: number) => (
              <ConnectionBlock
                key={id}
                connection={connection}
                type="in"
                isOwner={isOwner}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </ScrollArea>
  );
}

export default ConnectionsConfig;
