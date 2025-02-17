import {
  useFetchIncomingConnections,
  useFetchOutgoingConnections,
} from "@/hooks/connections";
import { useFetchSourcesForBucket } from "@/hooks/sources";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import ConnectionBlock from "./ConnectionBlock";
import CreateConnectionBlock from "./CreateConnectionBlock";
import { mapSourceToIcon } from "../utility/Icons";
import { Source } from "@/types/source";
import { ChevronsUpDown, CirclePlus, Loader2 } from "lucide-react";
import { Connection } from "@/types/connection";
import { ScrollArea } from "../ui/scroll-area";

function ConnectionsConfig({
  bucketId,
  sourceId,
  isOwner,
}: {
  bucketId: string;
  sourceId: string;
  isOwner: boolean;
}) {
  const {
    data: outgoingConnections,
    isLoading: isLoadingOutgoingConnections,
    refetch: refetchOutgoingConnections,
  } = useFetchOutgoingConnections(bucketId, sourceId);
  const {
    data: incomingConnections,
    isLoading: isLoadingIncomingConnections,
    refetch: refetchIncomingConnections,
  } = useFetchIncomingConnections(bucketId, sourceId);
  const {
    data: allSources,
    isLoading: isLoadingAllSources,
    refetch: refetchOtherSources,
  } = useFetchSourcesForBucket(bucketId);

  const [outgoingConnectionsOpen, setOutgoingConnectionsOpen] = useState(true);
  const [incomingConnectionsOpen, setIncomingConnectionsOpen] = useState(true);
  const [sourcePopoverOpen, setSourcePopoverOpen] = useState(false);
  const [selectedToSourceId, setSelectedToSourceId] = useState<string>("");
  const [connectionPlaceHolderVisible, setConnectionPlaceHolderVisible] =
    useState(false);
  const [otherSources, setOtherSources] = useState<Source[]>([]);

  useEffect(() => {
    if (allSources) {
      setOtherSources(
        allSources.filter((src: Source) => src.sourceId !== sourceId)
      );
    }
  }, [allSources, sourceId]);

  const handleSelectToSource = (src: string) => {
    setSelectedToSourceId(src);
    setSourcePopoverOpen(false);
    setOutgoingConnectionsOpen(true);
    setConnectionPlaceHolderVisible(true);
  };
  const totalConnections =
    (outgoingConnections?.length || 0) + (incomingConnections?.length || 0);
  return (
    <ScrollArea className="border rounded-lg p-4 flex flex-col hidden lg:block h-[calc(100vh-160px)]">
      <div className="flex items-center justify-between space-x-4 px-4 ">
        <h4 className="font-mono text-sm">
          {totalConnections
            ? `${totalConnections} connection${
                totalConnections > 1 ? "s" : ""
              }. `
            : "No connections yet. "}
          <Popover open={sourcePopoverOpen} onOpenChange={setSourcePopoverOpen}>
            {isOwner && (
              <PopoverTrigger asChild>
                <Button
                  variant="link"
                  className="p-0 w-fit text-violet-400 hover:underline"
                >
                  Create One? <CirclePlus size={16} className="ml-2" />
                </Button>
              </PopoverTrigger>
            )}

            <PopoverContent className="w-[500px]">
              <Command>
                <CommandInput placeholder="Search sources..." />
                <CommandList>
                  <CommandEmpty>
                    No sources found. <span>Create one?</span>
                  </CommandEmpty>
                  <CommandGroup>
                    {otherSources?.map((otherSource: Source, id: number) => (
                      <CommandItem
                        key={id + 1000}
                        className="cursor-pointer items-start wrap "
                        onSelect={() => {
                          handleSelectToSource(otherSource.sourceId);
                        }}
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
        </h4>
      </div>

      <Collapsible
        open={outgoingConnectionsOpen}
        onOpenChange={setOutgoingConnectionsOpen}
        className="w-full space-y-2"
      >
        <div className="rounded-md w-full px-4 font-mono text-sm shadow-sm flex justify-between items-center">
          <span className="text-violet-400">@Outgoing</span>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              <ChevronsUpDown className="h-4 w-4" />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="space-y-2 w-full px-4 pb-2 font-mono text-sm">
          {isLoadingOutgoingConnections ? (
            <Loader2 className="animate-spin" />
          ) : (
            <>
              {!outgoingConnections?.length &&
                !connectionPlaceHolderVisible && <span>Nothing yet.</span>}
              {connectionPlaceHolderVisible && selectedToSourceId && (
                <CreateConnectionBlock
                  fromSourceId={sourceId}
                  toSourceId={selectedToSourceId}
                  bucketId={bucketId}
                  setCreateConnectionVisible={setConnectionPlaceHolderVisible}
                  onConnectionCreated={refetchOutgoingConnections}
                />
              )}
              {outgoingConnections &&
                outgoingConnections?.map(
                  (connection: Connection, id: number) => (
                    <ConnectionBlock
                      key={id}
                      connection={connection}
                      type="out"
                      onDelete={() => refetchOutgoingConnections()}
                      isOwner={isOwner}
                    />
                  )
                )}
            </>
          )}
        </CollapsibleContent>
      </Collapsible>
      <Collapsible
        open={incomingConnectionsOpen}
        onOpenChange={setIncomingConnectionsOpen}
        className="w-full space-y-2"
      >
        <div className="rounded-md w-full px-4 font-mono text-sm shadow-sm flex justify-between items-center">
          <span className="text-violet-400">@Incoming</span>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              <ChevronsUpDown className="h-4 w-4" />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="space-y-2 w-full px-4 pb-2 font-mono text-sm">
          {isLoadingIncomingConnections ? (
            <Loader2 className="animate-spin" />
          ) : !incomingConnections?.length ? (
            <span>Nothing yet.</span>
          ) : incomingConnections ? (
            incomingConnections.map((connection: Connection, id: number) => (
              <ConnectionBlock
                key={id}
                connection={connection}
                type="in"
                onDelete={() => refetchIncomingConnections()}
                isOwner={isOwner}
              />
            ))
          ) : null}
        </CollapsibleContent>
      </Collapsible>
    </ScrollArea>
  );
}

export default ConnectionsConfig;
