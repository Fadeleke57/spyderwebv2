import { Source } from "@/types/source";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
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
import { CirclePlus, Plus, Search } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Separator } from "../ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { getTypeIcon } from "../chat/genui/graphcontext";
import "@hackernoon/pixel-icon-library/fonts/iconfont.css";
import { useSourceStore } from "@/store/sourceStore";
import { useFetchWebById } from "@/hooks/webs";
import { useUser } from "@/providers/UserProvider";
import { useRouter } from "next/router";

type SearchSourceModalProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  sources: Source[];
  handleSourceClick: (sourceId: string) => void;
};

const newTabs = [
  {
    label: "Files",
    value: "files",
    placeholder: "Search files...",
    emptyValue: "Add a file, voice note, or note to get started.",
    types: ["document", "voice_note", "note"],
  },
  {
    label: "Links",
    value: "links",
    placeholder: "Search links...",
    emptyValue: "Add a link to get started. Youtube videos, websites, etc.",
    types: ["website", "youtube"],
  },
];

function SearchSourceModal({
  open,
  setOpen,
  sources,
  handleSourceClick,
}: SearchSourceModalProps) {
  const isMobile = useIsMobile();
  const { setIsUploadingSource } = useSourceStore();
  const { user } = useUser();
  const router = useRouter();
  const { webId } = router.query;
  const { data: web } = useFetchWebById(webId as string);
  const isOwner = web && user && web.userId === user.id;

  const content = (
    <Tabs className="px-4" defaultValue="files">
      <TabsList className="bg-transparent rounded-none border-b w-full flex items-center justify-start">
        <div>
          {newTabs.map(({ label, value }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="flex-1 data-[state=inactive]:border-none data-[state=active]:border-1 data-[state=active]:border-primary data-[state=active]:rounded-b-none"
            >
              {label}
            </TabsTrigger>
          ))}
        </div>
      </TabsList>
      {newTabs.map(({ value, placeholder, emptyValue, types }) => (
        <TabsContent
          key={value}
          value={value}
          className="data-[state=active]:animate-fadeIn"
        >
          <Command className="bg-transparent no-scrollbar">
            <div className="flex flex-col-reverse  gap-2 lg:flex-row items-center justify-between mb-2 px-1">
              <div className=" w-full lg:w-auto">
                <CommandInput
                  placeholder={placeholder}
                  className="bg-muted h-10 w-64  w-full lg:w-auto"
                />
              </div>
              {isOwner && (
                <div className="w-full lg:w-auto">
                  <Button
                    onClick={() => {
                      setOpen(false);
                      setIsUploadingSource(true);
                    }}
                    className="h-10 w-full lg:w-auto border dark:bg-violet-400/30 dark:border-violet-200 dark:hover:bg-violet-400/40 rounded-lg"
                  >
                    <CirclePlus size={12} className="mr-1" /> Add{" "}
                    {value === "files" ? "file" : "link"}{" "}
                  </Button>{" "}
                </div>
              )}
            </div>
            <CommandList className="h-[50dvh] no-scroll-bg">
              <CommandEmpty className="text-muted-foreground">
                {emptyValue}
              </CommandEmpty>
              <CommandGroup>
                {sources &&
                  sources
                    .filter((source) => types.includes(source.type)) // Filter sources based on the 'types' array
                    .map((source: Source, id: number) => (
                      <CommandItem
                        key={id}
                        className="cursor-pointer items-center"
                        onSelect={() => handleSourceClick(source.sourceId)}
                        value={`${source.name}${id}`}
                      >
                        {getTypeIcon(source.type, true)}
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
          <Tooltip delayDuration={100}>
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
        <DrawerContent className="no-scrollbar h-[90dvh] px-0">
          {" "}
          <DrawerTitle className="flex items-center p-4">
            <Search size={16} className="mr-2"></Search>
            <span className="font-semibold">Sources</span>
          </DrawerTitle>
          <Separator className="my-2" />
          <div className="p-4 px-0">{content}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip delayDuration={100}>
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
      <DialogContent className="lg:max-w-2xl no-scrollbar px-0">
        <DialogHeader className="px-4">
          <DialogTitle className="flex items-center text-lg">
            <i className="hn hn-search mr-2"></i>{" "}
            <span className="font-base">Sources</span>
          </DialogTitle>
        </DialogHeader>
        <Separator className="my-2" />
        {content}
      </DialogContent>
    </Dialog>
  );
}

export default SearchSourceModal;
