import { Source } from "@/types/source";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Button } from "../ui/button";
import { Search } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { mapSourceToIcon } from "../utility/Icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";

type SearchSourceModalProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  sources: Source[];
  handleSourceClick: (sourceId: string) => void;
};

function SearchSourceModal({
  open,
  setOpen,
  sources,
  handleSourceClick,
}: SearchSourceModalProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="rounded-full p-0 px-[10px] m-0"
              >
                <Search size={20} />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Search sources</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent className="lg:max-w-2xl no-scrollbar">
        {" "}
        <DialogTitle className="flex items-center">
          <Search size={16} className="mr-2"></Search>Search Sources
        </DialogTitle>
        <Separator className="my-2" />
        <ScrollArea className="h-[70dvh]">
          <Tabs defaultValue="document">
            <TabsList className="bg-transparent w-full md:w-auto">
              <TabsTrigger
                value="document"
                className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                Files
              </TabsTrigger>
              <TabsTrigger
                value="website"
                className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                Links
              </TabsTrigger>
              <TabsTrigger
                value="youtube"
                className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                YouTube
              </TabsTrigger>
              <TabsTrigger
                value="note"
                className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                Notes
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="document"
              className="data-[state=active]:animate-fadeIn"
            >
              <Command className="bg-transparent no-scrollbar">
                <CommandInput
                  placeholder="Search files..."
                  className="bg-transparent"
                />
                <CommandList>
                  <CommandEmpty>
                    No files found. <span>Add one?</span>
                  </CommandEmpty>
                  <CommandGroup>
                    {sources &&
                      sources
                        .filter((source) => source.type === "document")
                        .map((source: Source, id: number) => (
                          <CommandItem
                            key={id}
                            className="cursor-pointer items-start"
                            onSelect={() => handleSourceClick(source.sourceId)}
                            value={`${source.name}${id}`}
                          >
                            {mapSourceToIcon(source.type, 16)}
                            <span className="ml-2">{source.name}</span>
                          </CommandItem>
                        ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </TabsContent>

            <TabsContent
              value="website"
              className="data-[state=active]:animate-fadeIn"
            >
              <Command className="bg-transparent no-scrollbar">
                <CommandInput
                  placeholder="Search links..."
                  className="bg-transparent"
                />
                <CommandList>
                  <CommandEmpty>
                    No links found. <span>Add one?</span>
                  </CommandEmpty>
                  <CommandGroup>
                    {sources &&
                      sources
                        .filter((source) => source.type === "website")
                        .map((source: Source, id: number) => (
                          <CommandItem
                            key={id}
                            className="cursor-pointer items-start"
                            onSelect={() => handleSourceClick(source.sourceId)}
                            value={`${source.name}${id}`}
                          >
                            {mapSourceToIcon(source.type, 16)}
                            <span className="ml-2">{source.name}</span>
                          </CommandItem>
                        ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </TabsContent>

            <TabsContent
              value="youtube"
              className="data-[state=active]:animate-fadeIn"
            >
              <Command className="bg-transparent no-scrollbar">
                <CommandInput
                  placeholder="Search YouTube videos..."
                  className="bg-transparent"
                />
                <CommandList>
                  <CommandEmpty>
                    No videos found. <span>Add one?</span>
                  </CommandEmpty>
                  <CommandGroup>
                    {sources &&
                      sources
                        .filter((source) => source.type === "youtube")
                        .map((source: Source, id: number) => (
                          <CommandItem
                            key={id}
                            className="cursor-pointer items-start"
                            onSelect={() => handleSourceClick(source.sourceId)}
                            value={`${source.name}${id}`}
                          >
                            {mapSourceToIcon(source.type, 16)}
                            <span className="ml-2">{source.name}</span>
                          </CommandItem>
                        ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </TabsContent>

            <TabsContent
              value="note"
              className="data-[state=active]:animate-fadeIn"
            >
              <Command className="bg-transparent no-scrollbar">
                <CommandInput
                  placeholder="Search notes..."
                  className="bg-transparent"
                />
                <CommandList>
                  <CommandEmpty>
                    No notes found. <span>Add one?</span>
                  </CommandEmpty>
                  <CommandGroup>
                    {sources &&
                      sources
                        .filter((source) => source.type === "note")
                        .map((source: Source, id: number) => (
                          <CommandItem
                            key={id}
                            className="cursor-pointer items-start"
                            onSelect={() => handleSourceClick(source.sourceId)}
                            value={`${source.name}${id}`}
                          >
                            {mapSourceToIcon(source.type, 16)}
                            <span className="ml-2">{source.name}</span>
                          </CommandItem>
                        ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default SearchSourceModal;
