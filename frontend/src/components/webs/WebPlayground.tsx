import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Label } from "../ui/label";
import {
  ChevronsUpDown,
  Link,
  File,
  Notebook,
  Youtube,
  Minimize2,
  Maximize2,
  Search,
} from "lucide-react";
import { Web } from "@/types/web";
import { PublicUser } from "@/types/user";
import AddSourceModal from "./AddSourceModal";
import WebGraph from "./WebGraph";
import { WebConfigFormValues } from "@/types/article";
import { Source } from "@/types/source";
import { useFetchSourcesForWeb, useUploadNote } from "@/hooks/sources";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import WebDataModal from "./WebDataModal";

import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { mapSourceToIcon } from "../utility/Icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import WebSettingsModal from "./WebSettingsModal";
import { toast } from "../ui/use-toast";

const SOURCES_DIALOG_KEYBOARD_CSHORTCUT = "k";

function WebPlayground({
  web,
  user,
  refetch,
}: {
  web: Web;
  user: PublicUser | null;
  refetch: () => void;
}) {
  const {
    mutateAsync: uploadNote,
    isPending,
    error,
  } = useUploadNote(web?.webId);
  const [config, setConfig] = useState<WebConfigFormValues>({
    title: web?.name || "",
    description: web?.description || "",
  });
  const [searchDialogOpen, setSearchDialogOpen] = useState<boolean>(false);

  const {
    data: sources,
    isLoading: sourcesLoading,
    error: sourcesError,
    refetch: refetchSources,
  } = useFetchSourcesForWeb(web?.webId);

  const isOwner = user && user?.id === web?.userId;
  const [selectedSourceId, setSelectedSourceId] = useState<string>("");
  const [fetchedSources, setFetchedSources] = useState<Source[]>([]);
  const [isWebDataModalOpen, setIsWebDataModalOpen] = useState(false);
  const [isAddSourceModalOpen, setIsAddSourceModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [webSearchModalView, setAddSourceModalView] = useState<
    "youtube" | "website" | "default" | "note"
  >("default");

  const handleSourceClick = (sourceId: string) => {
    setSelectedSourceId(sourceId);
    setIsWebDataModalOpen(true);
    setSearchDialogOpen(false);
  };

  const handleDropdownButtonClick = (
    view: "youtube" | "website" | "default" | "note"
  ) => {
    setAddSourceModalView(view);
    setIsAddSourceModalOpen(true);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    localStorage.setItem("expanded", String(!isExpanded));
  };

  const handleCreateEmptyNote = async () => {
    try {
      const noteId = await uploadNote({
        title: "Untitled",
        content: "",
      });
      setSelectedSourceId(noteId);
      refetchSources();
      refetch();
      setIsWebDataModalOpen(true);
    } catch (error: any) {
      toast({
        title: "Error creating web",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (sources) {
      setFetchedSources(sources);
    }

    if (localStorage.getItem("expanded") === "true") {
      setIsExpanded(true);
    }
  }, [sources]);

  const toggleSearchDialogOpen = React.useCallback(() => {
    setSearchDialogOpen((prev: boolean) => !prev);
  }, [setSearchDialogOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SOURCES_DIALOG_KEYBOARD_CSHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        toggleSearchDialogOpen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSearchDialogOpen]);

  return (
    <div
      className={`${
        isExpanded
          ? "absolute inset-0 z-50 h-[100dvh] w-full bg-neutral-800"
          : "h-full min-h-[50vh] flex-col lg:col-span-2 bg-muted/50 rounded-xl"
      }`}
    >
      <div className="relative h-full w-full">
        <div
          className={`absolute flex flex-row items-center ${
            isExpanded ? "right-6" : "right-3"
          }  top-3`}
        >
          {isOwner && (
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger>
                  <WebSettingsModal refetchWeb={refetch} web={web} />{" "}
                </TooltipTrigger>
                <TooltipContent>Settings</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <Badge variant="outline" className={`border dark:border-violet-400`}>
            {web?.sourceIds?.length || 0} sources added
          </Badge>
        </div>

        <div
          className={`absolute bottom-8 ${
            isExpanded ? "right-6" : "right-6"
          } cursor-pointer z-10`}
        >
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger
                onClick={toggleExpand}
                className="p-2 rounded-full transition-colors"
              >
                {isExpanded ? (
                  <Button
                    className="rounded-full p-0 px-[10px]"
                    variant="outline"
                  >
                    <Minimize2 size={20} />
                  </Button>
                ) : (
                  <Button
                    className="rounded-full p-0 px-[10px]"
                    variant="outline"
                  >
                    <Maximize2 size={20} />
                  </Button>
                )}
              </TooltipTrigger>
              <TooltipContent>
                <p>{isExpanded ? "Collapse view" : "Expand view"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {isOwner &&
        (web?.sourceIds?.length === undefined ||
          web?.sourceIds?.length === null ||
          web?.sourceIds?.length > 0) ? (
          <div
            className={`absolute ${isExpanded ? "right-6" : "right-3"} top-12`}
          >
            <AddSourceModal
              open={isAddSourceModalOpen}
              setOpen={setIsAddSourceModalOpen}
              setIsWebDataModalOpen={setIsWebDataModalOpen}
              setSelectedSourceId={setSelectedSourceId}
              web={web}
              config={config}
              setConfig={setConfig}
              refreshSources={refetchSources}
              refreshWeb={refetch}
              view={webSearchModalView}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="rounded-full h-8 dark:bg-violet-500 dark:hover:bg-violet-400 ">
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
                      </DropdownMenuItem>
                    </DialogTrigger>
                    <DialogTrigger
                      asChild
                      onClick={() => handleDropdownButtonClick("default")}
                    >
                      <DropdownMenuItem className="cursor-pointer">
                        <File size={16} className="mr-2" />
                        <span>File</span>
                      </DropdownMenuItem>
                    </DialogTrigger>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => handleCreateEmptyNote()}
                    >
                      <Notebook size={16} className="mr-2" />
                      <span>Note</span>
                    </DropdownMenuItem>

                    <DialogTrigger
                      asChild
                      onClick={() => handleDropdownButtonClick("youtube")}
                    >
                      <DropdownMenuItem className="cursor-pointer">
                        <Youtube size={16} className="mr-2" />
                        <span>Youtube</span>
                      </DropdownMenuItem>
                    </DialogTrigger>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </AddSourceModal>
          </div>
        ) : null}
        {isOwner && web?.sourceIds?.length === 0 && (
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/4 flex flex-col items-center gap-1 text-center min-w-[300px]">
            <h3 className="text-2xl font-bold tracking-tight">
              Add your first source
            </h3>
            <p className="text-sm text-muted-foreground">
              Start collecting data to add your mind map here.
            </p>
            <div className="flex flex-wrap gap-2 whitespace-nowrap mt-2 justify-center">
              {" "}
              <AddSourceModal
                open={isAddSourceModalOpen}
                setOpen={setIsAddSourceModalOpen}
                setSelectedSourceId={setSelectedSourceId}
                setIsWebDataModalOpen={setIsWebDataModalOpen}
                web={web}
                config={config}
                setConfig={setConfig}
                refreshSources={refetchSources}
                refreshWeb={refetch}
                view={webSearchModalView}
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
                        </DropdownMenuItem>
                      </DialogTrigger>
                      <DialogTrigger
                        asChild
                        onClick={() => handleDropdownButtonClick("default")}
                      >
                        <DropdownMenuItem className="cursor-pointer">
                          <File size={16} className="mr-2" />
                          <span>File</span>
                        </DropdownMenuItem>
                      </DialogTrigger>

                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => handleCreateEmptyNote()}
                      >
                        <Notebook size={16} className="mr-2" />
                        <span>Note</span>
                      </DropdownMenuItem>

                      <DialogTrigger
                        asChild
                        onClick={() => handleDropdownButtonClick("youtube")}
                      >
                        <DropdownMenuItem className="cursor-pointer">
                          <Youtube size={16} className="mr-2" />
                          <span>Youtube</span>
                        </DropdownMenuItem>
                      </DialogTrigger>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </AddSourceModal>
            </div>
          </div>
        )}
        <div className="flex-1" />
        <WebGraph
          isOwner={isOwner || false}
          setConfig={setConfig}
          webId={web?.webId}
          hasSources={web?.sourceIds?.length ? true : false}
          fetchedSources={fetchedSources}
          setFetchedSources={setFetchedSources}
          refetchSources={refetchSources}
          sourcesLoading={sourcesLoading}
          selectedSourceId={selectedSourceId}
          setSelectedSourceId={setSelectedSourceId}
        />
        <div className="absolute bottom-8 left-6">
          <div className="flex w-fit rounded-full flex-col pt-0">
            <Dialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={searchDialogOpen}
                        className="w-full justify-between p-0 m-0 rounded-full p-2 px-[10px]"
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

              <DialogContent className="lg:max-w-2xl">
                <DialogTitle hidden className="pl-4"></DialogTitle>
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
                      {sources?.map((source: Source, id: number) => (
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
              </DialogContent>
            </Dialog>
          </div>
        </div>
        {isWebDataModalOpen && selectedSourceId && web?.webId && (
          <WebDataModal
            open={isWebDataModalOpen}
            setOpen={setIsWebDataModalOpen}
            sourceId={selectedSourceId}
            webId={web.webId}
          />
        )}
      </div>
    </div>
  );
}

export default WebPlayground;
