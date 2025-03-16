import { useFetchSourcesForWeb } from "@/hooks/sources";
import React, { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandInput,
} from "../ui/command";
import { Source } from "@/types/source";
import { mapSourceToIcon } from "../utility/Icons";

function SourcesPopover({
  anchorSourceId,
  webId,
  children,
  handleSourceClick,
}: {
  anchorSourceId: string;
  webId: string;
  children: React.ReactNode;
  handleSourceClick: (sourceId: string) => void;
}) {
  const { data: sources } = useFetchSourcesForWeb(webId);
  const [otherSources, setOtherSources] = useState<Source[]>([]);

  useEffect(() => {
    if (sources) {
      const filteredSources = sources.filter(
        (source: Source) => source.sourceId !== anchorSourceId
      );
      setOtherSources(filteredSources);
    }
  }, [sources, anchorSourceId]);

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80">
        <Command className="bg-transparent">
          <CommandInput
            placeholder="Search sources..."
            className="bg-transparent"
          />
          <CommandList>
            <CommandEmpty>
              No sources found. <span>Create one?</span>
            </CommandEmpty>
            <CommandGroup>
              {otherSources?.map((source: Source, id: number) => (
                <CommandItem
                  key={id}
                  className="cursor-pointer items-start"
                  onSelect={() => handleSourceClick(source.sourceId)}
                >
                  {mapSourceToIcon(source.type, 16)}
                  {source.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default SourcesPopover;
