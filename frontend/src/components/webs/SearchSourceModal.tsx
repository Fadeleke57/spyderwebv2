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
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { getTypeIcon } from "../chat/genui/graphcontext";

type SearchSourceModalProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  sources: Source[];
  handleSourceClick: (sourceId: string) => void;
};

const tabs = [
  {
    label: "Documents",
    value: "document",
    placeholder: "Search files...",
    type: "document",
  },
  {
    label: "Voice",
    value: "voice_note",
    placeholder: "Search notes...",
    type: "voice_note",
  },
  {
    label: "Links",
    value: "website",
    placeholder: "Search links...",
    type: "website",
  },
  {
    label: "YouTube",
    value: "youtube",
    placeholder: "Search YouTube videos...",
    type: "youtube",
  },
  {
    label: "Notes",
    value: "note",
    placeholder: "Search notes...",
    type: "note",
  },
];

function SearchSourceModal({
  open,
  setOpen,
  sources,
  handleSourceClick,
}: SearchSourceModalProps) {
  const isMobile = useIsMobile();

  const content = (
    <Tabs defaultValue="document">
      <TabsList className="bg-transparent w-full md:w-auto">
        {tabs.map(({ label, value }) => (
          <TabsTrigger
            key={value}
            value={value}
            className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
          >
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map(({ value, placeholder, type }) => (
        <TabsContent
          key={value}
          value={value}
          className="data-[state=active]:animate-fadeIn"
        >
          <Command className="bg-transparent no-scrollbar">
            <CommandInput
              placeholder={placeholder}
              className="bg-transparent"
            />
            <CommandList className="h-[50dvh] no-scroll-bg">
              <CommandEmpty>
                No {type}s found. <span>Add one?</span>
              </CommandEmpty>
              <CommandGroup>
                {sources &&
                  sources
                    .filter((source) => source.type === type)
                    .map((source: Source, id: number) => (
                      <CommandItem
                        key={id}
                        className="cursor-pointer items-center"
                        onSelect={() => handleSourceClick(source.sourceId)}
                        value={`${source.name}${id}`}
                      >
                        {getTypeIcon(source.type)}
                        <span className="ml-1">{source.name}</span>
                      </CommandItem>
                    ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </TabsContent>
      ))}
    </Tabs>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DrawerTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="rounded-full p-0 px-[10px] m-0"
                >
                  <Search size={20} />
                </Button>
              </DrawerTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Search sources</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DrawerContent className="lg:max-w-2xl no-scrollbar h-[70dvh]">
          {" "}
          <DrawerTitle className="flex items-center p-4">
            <Search size={16} className="mr-2"></Search>Search Sources
          </DrawerTitle>
          <Separator className="my-2" />
          <div className="p-4">{content}</div>
        </DrawerContent>
      </Drawer>
    );
  }

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
        {content}
      </DialogContent>
    </Dialog>
  );
}

export default SearchSourceModal;
