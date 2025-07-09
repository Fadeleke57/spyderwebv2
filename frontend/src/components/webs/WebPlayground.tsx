import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useSourceStore } from "@/store/sourceStore";
import { Minimize2, Maximize2, Plus, Network, List } from "lucide-react";
import WebGraph from "./WebGraph";
import { Source } from "@/types/source";
import { useFetchSourcesForWeb, useFileUpload } from "@/hooks/sources";

import WebDataModal from "./WebDataModal";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import WebSettingsModal from "./WebSettingsModal";
import { toast } from "../ui/use-toast";
import { useFetchAllConnectionsForWeb } from "@/hooks/connections";
import SearchSourceModal from "./SearchSourceModal";
import ExportContextModal from "./ExportContextModal";
import { useRouter } from "next/router";
import { useFetchWebById } from "@/hooks/webs";
import SimpleTooltip from "../utility/SimpleTooltip";
import { useAuthorization } from "@/providers/AuthorizationProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import SourceListView from "./SourceListView";
import SpydrAI from "../utility/Assistant";

const SOURCES_DIALOG_KEYBOARD_CSHORTCUT = "k";

function WebPlayground() {
  const router = useRouter();
  const { webId } = router.query;
  const [selectedTab, setSelectedTab] = useState("list");
  const { data: web, refetch: refetchWeb } = useFetchWebById(webId as string);
  const {
    selectedSourceId,
    setSelectedSourceId,
    isWebDataModalOpen,
    setIsWebDataModalOpen,
    isUploadingSource,
    setIsUploadingSource,
  } = useSourceStore();
  const { isResourceOwner, canWrite } = useAuthorization();

  const { mutateAsync: uploadFile, isPending: isFileUploading } = useFileUpload(
    webId as string
  );

  const [searchDialogOpen, setSearchDialogOpen] = useState<boolean>(false);
  const [exportContextModalOpen, setExportContextModalOpen] =
    useState<boolean>(false);

  const [fetchedSources, setFetchedSources] = useState<Source[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    data: sources,
    isLoading: sourcesLoading,
    refetch: refetchSources,
  } = useFetchSourcesForWeb(web && web.webId);

  const { data: connections, isLoading: connectionsLoading } =
    useFetchAllConnectionsForWeb(web?.webId || "");

  const [addIconOrientation, setAddIconOrientation] = useState<number>(0);

  const handleOrientationChange = (open: boolean) => {
    setAddIconOrientation(open ? 45 : -45);
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }
    try {
      if (files.length > 1) {
        await uploadFile({
          files: files,
          parseObsidianLinks: true,
        });
        setIsUploadingSource(true);
        toast({
          title: `Uploading ${files.length} files`,
          description: "Processing...",
        });
        refetchSources();
        refetchWeb();
        setIsUploadingSource(false);
      } else {
        try {
          const { firstSourceId: sourceId } = await uploadFile({
            files: files,
            parseObsidianLinks: false,
          });
          refetchSources();
          refetchWeb();
          setSelectedSourceId(sourceId);
          setIsWebDataModalOpen(true);
          toast({
            title: "File uploaded successfully!",
            description: "Processing...",
          });
          setIsUploadingSource(false);
        } catch (error: any) {
          console.error(error);
          toast({
            variant: "destructive",
            title: "Error uploading file(s)",
            description: error.message || "An unexpected error occurred.",
          });
          setIsUploadingSource(false);
        }
      }
    } catch (err: any) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error uploading file(s)",
        description: err.message || "An unexpected error occurred.",
      });
      setIsUploadingSource(false);
    }
  };

  const handleSourceClick = (sourceId: string) => {
    setSelectedSourceId(sourceId);
    setIsWebDataModalOpen(true);
    setSearchDialogOpen(false);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    localStorage.setItem(`expanded-${web?.webId}`, String(!isExpanded));
  };

  useEffect(() => {
    if (sources) {
      setFetchedSources(sources);
    }

    if (
      web &&
      web.webId &&
      localStorage.getItem(`expanded-${web.webId}`) === "true"
    ) {
      setIsExpanded(true);
    }
  }, [sources, web]);

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

  useEffect(() => {
    handleOrientationChange(isUploadingSource);
  }, [isUploadingSource]);

  return (
    <Tabs className="w-full lg:col-span-2" defaultValue="list">
      <div className="relative flex flex-col h-full gap-0">
        <TabsList className="rounded-none bg-background w-full flex justify-start pl-0 m-0 h-fit pb-0">
          <div>
            <TabsTrigger
              value="list"
              className="rounded-t-md rounded-b-none data-[state=active]:dark:bg-violet-400/40 data-[state=active]:dark:border-violet-200"
              onClick={() => {
                setIsUploadingSource(false);
                setSelectedTab("list");
              }}
            >
              List View <List className="ml-2" size={14} />
            </TabsTrigger>
            <TabsTrigger
              value="graph"
              className="rounded-t-md rounded-b-none data-[state=active]:dark:bg-violet-400/40 data-[state=active]:dark:border-violet-200"
              onClick={() => {
                setIsUploadingSource(false);
                setSelectedTab("graph");
              }}
            >
              Graph View <Network className="ml-2" size={14} />
            </TabsTrigger>
          </div>
        </TabsList>
        <TabsContent
          value="graph"
          className={`mt-0 ${
            isExpanded
              ? "absolute inset-0 z-50 h-[100dvh] w-full bg-neutral-800"
              : "h-full flex-col lg:col-span-2 bg-muted/50 rounded-xl rounded-tl-none"
          }`}
        >
          <div className="relative h-full w-full">
            <div
              className={`absolute flex flex-row items-center ${
                isExpanded ? "right-6" : "right-3"
              }  top-3`}
            >
              {isResourceOwner && <WebSettingsModal webId={web.webId} />}
              <Badge
                variant="outline"
                className={`border dark:border-violet-400/70`}
              >
                {(web?.sourceIds && web.sourceIds.length) || 0} memor
                {web?.sourceIds?.length === 1 ? "y" : "ies"} added
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
                <div className="flex gap-2 items-center">
                  <SearchSourceModal
                    open={searchDialogOpen}
                    setOpen={setSearchDialogOpen}
                    sources={fetchedSources}
                    handleSourceClick={handleSourceClick}
                  ></SearchSourceModal>
                  <ExportContextModal
                    open={exportContextModalOpen}
                    setOpen={setExportContextModalOpen}
                    sources={fetchedSources}
                  />
                </div>
              )}
            </div>
            {canWrite &&
              (web.sourceIds?.length === undefined ||
                web.sourceIds?.length === null ||
                web.sourceIds?.length > 0) && (
                <div
                  className={`absolute ${isExpanded ? "right-6" : "right-3"} top-12`}
                >
                  <SimpleTooltip content="Add memory" side="left">
                    <Button
                      size={"icon"}
                      onClick={() => {
                        handleOrientationChange(!isUploadingSource);
                        setIsUploadingSource(!isUploadingSource);
                      }}
                      className="dark:bg-violet-400/40 dark:border dark:border-foreground dark:hover:bg-violet-400/50 rounded-full p-1 h-fit w-fit"
                    >
                      <Plus
                        strokeWidth={2}
                        size={16}
                        className={`rotate-${addIconOrientation} transition-transform ease-in-out duration-300`}
                      />
                    </Button>
                  </SimpleTooltip>
                </div>
              )}
            {canWrite &&
              web.sourceIds &&
              web.sourceIds.length === 0 &&
              !isFileUploading && (
                <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/4 flex flex-col items-center gap-1 text-center min-w-[300px]">
                  <h3 className="text-lg font-bold tracking-tight">
                    Add your first memory
                  </h3>
                  <p className="text-sm max-w-xs text-muted-foreground">
                    Drag and drop or click below to start collecting information
                    to add your web.
                  </p>
                  <div className="flex flex-wrap gap-2 whitespace-nowrap mt-2 justify-center">
                    <Button
                      size={"icon"}
                      className="dark:border dark:border-foreground dark:hover:bg-violet-400/60 dark:bg-violet-400/40 rounded-full py-1 px-3 h-fit w-fit"
                      onClick={() => setIsUploadingSource(true)}
                    >
                      <Plus
                        strokeWidth={2}
                        size={16}
                        onClick={() => {
                          handleOrientationChange(!isUploadingSource);
                          setIsUploadingSource(!isUploadingSource);
                        }}
                        className={`rotate-${addIconOrientation} transition-transform ease-in-out duration-300 mr-2`}
                      />
                      Create
                    </Button>
                  </div>
                </div>
              )}
            <div className="flex-1" />
            <WebGraph
              hasSources={web?.sourceIds?.length ? true : false}
              fetchedSources={fetchedSources}
              setFetchedSources={setFetchedSources}
              sourcesLoading={sourcesLoading}
              handleFileUpload={handleFileUpload}
              connections={connections}
              connectionsLoading={connectionsLoading}
            />
          </div>
        </TabsContent>
        <TabsContent
          className="mt-0 h-full bg-muted/50 rounded-xl rounded-tl-none p-4"
          value="list"
        >
          <SourceListView
            hasSources={web?.sourceIds?.length ? true : false}
            sources={fetchedSources}
            onSourceClick={handleSourceClick}
            sourcesLoading={sourcesLoading}
          />
        </TabsContent>
        <div
          className={`absolute ${selectedTab === "graph" ? "bottom-4 right-4" : "bottom-4 right-0"}`}
        >
          <SpydrAI />
        </div>
      </div>
      {isWebDataModalOpen && selectedSourceId && (
        <WebDataModal
          open={isWebDataModalOpen}
          setOpen={setIsWebDataModalOpen}
        />
      )}
    </Tabs>
  );
}

export default WebPlayground;
