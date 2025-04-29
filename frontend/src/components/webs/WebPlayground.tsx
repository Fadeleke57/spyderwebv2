import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Link,
  File,
  Notebook,
  Youtube,
  Minimize2,
  Maximize2,
  Search,
  Plus,
} from "lucide-react";
import { Web } from "@/types/web";
import { PublicUser } from "@/types/user";
import AddSourceModal from "./AddSourceModal";
import WebGraph from "./WebGraph";
import { CreateWeb } from "@/types/web";
import { Source } from "@/types/source";
import {
  useFetchSourcesForWeb,
  useFileUpload,
  useUploadNote,
} from "@/hooks/sources";

import WebDataModal from "./WebDataModal";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DialogTrigger,
} from "../ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import WebSettingsModal from "./WebSettingsModal";
import { toast } from "../ui/use-toast";
import ProcessModal from "@/components/webs/ProcessModal";
import { useFetchAllConnectionsForWeb } from "@/hooks/connections";
import SearchSourceModal from "./SearchSourceModal";

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
  const [config, setConfig] = useState<CreateWeb>({
    title: web?.name || "",
    description: web?.description || "",
  });
  const [searchDialogOpen, setSearchDialogOpen] = useState<boolean>(false);
  const [parseObsidianLinks, setParseObsidianLinks] = useState<boolean>(false);
  const [addIconOrientation, setAddIconOrientation] = useState<number>(0);
  const [proccessModalOpen, setProcessModalOpen] = useState<boolean>(false);
  const isOwner = user && user?.id === web?.userId;
  const [selectedSourceId, setSelectedSourceId] = useState<string>("");
  const [fetchedSources, setFetchedSources] = useState<Source[]>([]);
  const [isWebDataModalOpen, setIsWebDataModalOpen] = useState(false);
  const [isAddSourceModalOpen, setIsAddSourceModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [webSearchModalView, setAddSourceModalView] = useState<
    "youtube" | "website" | "default" | "note"
  >("default");
  const { mutateAsync: uploadFile, isPending: isFileUploading } = useFileUpload(
    web?.webId || ""
  );
  const {
    data: sources,
    isLoading: sourcesLoading,
    error: sourcesError,
    refetch: refetchSources,
  } = useFetchSourcesForWeb(web?.webId);
  const {
    data: connections,
    isLoading: connectionsLoading,
    refetch: refetchConnections,
  } = useFetchAllConnectionsForWeb(web?.webId);

  const handleDropdownOpenChange = (open: boolean) => {
    setAddIconOrientation(open ? 45 : -45);
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }

    try {
      if (files.length > 1) {
        uploadFile({
          files: files,
          preserve_obsidian_links: parseObsidianLinks,
        });

        setTimeout(() => {
          setProcessModalOpen(true);
          setIsAddSourceModalOpen(false);
        }, 2000);
      } else {
        try {
          const { firstSourceId } = await uploadFile({
            files: files,
            preserve_obsidian_links: false,
          });

          refetchSources();
          refetch();
          setSelectedSourceId(firstSourceId);
          setIsWebDataModalOpen(true);
          setIsAddSourceModalOpen(false);
        } catch (error: any) {
          console.error(error);
          toast({
            variant: "destructive",
            title: "Error uploading file(s)",
          });
        }
      }
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error uploading file(s)",
      });
    }
  };

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
        title: "Error creating note",
        description: "Please try again",
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
          : "h-full flex-col lg:col-span-2 bg-muted/50 rounded-xl"
      }`}
    >
      <div className="relative h-full w-full">
        <div
          className={`absolute flex flex-row items-center ${
            isExpanded ? "right-6" : "right-3"
          }  top-3`}
        >
          {isOwner && <WebSettingsModal refetchWeb={refetch} web={web} />}
          <Badge
            variant="outline"
            className={`border dark:border-violet-400/70`}
          >
            {web?.sourceIds?.length || 0} sources added
          </Badge>
        </div>

        <div
          className={`absolute bottom-4 w-full px-3 cursor-pointer z-70 flex flex-row-reverse items-center justify-between`}
        >
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger
                onClick={toggleExpand}
                className="transition-colors"
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
              <TooltipContent className="z-99">
                <p>{isExpanded ? "Collapse view" : "Expand view"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {fetchedSources && (
            <SearchSourceModal
              open={searchDialogOpen}
              setOpen={setSearchDialogOpen}
              sources={fetchedSources}
              handleSourceClick={handleSourceClick}
            ></SearchSourceModal>
          )}
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
              handleFileUpload={handleFileUpload}
              isFileUploading={isFileUploading}
              setParseObsidianLinks={setParseObsidianLinks}
            >
              <TooltipProvider>
                <Tooltip delayDuration={100}>
                  <DropdownMenu onOpenChange={handleDropdownOpenChange}>
                    <TooltipTrigger>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size={"icon"}
                          className="dark:bg-violet-400/80 dark:hover:bg-violet-400 rounded-full p-1 h-fit w-fit"
                        >
                          <Plus
                            strokeWidth={3}
                            size={16}
                            className={`rotate-${addIconOrientation} transition-transform ease-in-out duration-300`}
                          />
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
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

                  <TooltipContent>Add source</TooltipContent>
                </Tooltip>
              </TooltipProvider>{" "}
            </AddSourceModal>
          </div>
        ) : null}
        {isOwner &&
          web?.sourceIds &&
          web?.sourceIds?.length === 0 &&
          !isFileUploading && (
            <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/4 flex flex-col items-center gap-1 text-center min-w-[300px]">
              <h3 className="text-2xl font-bold tracking-tight">
                Add your first source
              </h3>
              <p className="text-sm text-muted-foreground">
                Drag and drop or click below to start collecting information to
                add your web.
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
                  handleFileUpload={handleFileUpload}
                  isFileUploading={isFileUploading}
                  setParseObsidianLinks={setParseObsidianLinks}
                >
                  <DropdownMenu onOpenChange={handleDropdownOpenChange}>
                    <DropdownMenuTrigger asChild>
                      <Button className="rounded-full h-8">
                        <Plus
                          strokeWidth={3}
                          size={16}
                          className={`mr-2 rotate-${addIconOrientation} transition-transform ease-in`}
                        />
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
          refetchWeb={refetch}
          sourcesLoading={sourcesLoading}
          selectedSourceId={selectedSourceId}
          setSelectedSourceId={setSelectedSourceId}
          handleFileUpload={handleFileUpload}
          isFileUploading={isFileUploading}
          connections={connections}
          connectionsLoading={connectionsLoading}
          refetchConnections={refetchConnections}
        />
        <div className="absolute bottom-8 left-6">
          <div className="flex w-fit rounded-full flex-col pt-0"></div>
        </div>
        {isWebDataModalOpen && selectedSourceId && web?.webId && (
          <WebDataModal
            open={isWebDataModalOpen}
            setOpen={setIsWebDataModalOpen}
            sourceId={selectedSourceId}
            webId={web.webId}
          />
        )}
        {proccessModalOpen && web?.webId && (
          <ProcessModal
            refetchWeb={refetch}
            refetchSources={refetchSources}
            refetchConnections={refetchConnections}
            webId={web.webId}
            isOpen={proccessModalOpen}
            onOpenChange={setProcessModalOpen}
          ></ProcessModal>
        )}
      </div>
    </div>
  );
}

export default WebPlayground;
