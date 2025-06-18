import React, { useEffect } from "react";
import { FolderOutput, FolderUp } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { Source } from "@/types/source";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  ExportGraphPayload,
  useExportGraph,
  useFetchWebById,
} from "@/hooks/webs";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/router";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Checkbox } from "../ui/checkbox";

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  sources: Source[];
}

function ExportContextModal({ open, setOpen, sources }: Props) {
  const isMobile = useIsMobile();
  const router = useRouter();

  const { webId } = router.query;
  const {
    data: web,
    isLoading: webLoading,
    error: webError,
  } = useFetchWebById(webId as string);

  const [exportConfig, setExportConfig] = React.useState<ExportGraphPayload>({
    webId: webId as string,
    selectedSources: sources.map((s) => s.sourceId),
    asMarkdown: true,
  });

  const {
    mutateAsync: exportGraph,
    isPending: isExportPending,
    isError: isExportError,
  } = useExportGraph();

  const handleExport = async () => {
    if (!webId || !exportConfig.selectedSources.length) return;
    try {
      const result = await exportGraph(exportConfig);

      if (exportConfig.asMarkdown) {
        const url = window.URL.createObjectURL(result);
        const a = document.createElement("a");
        a.href = url;
        a.download = web
          ? `${web.name.slice(0, 40)}.md`
          : `context_${webId}.md`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "Context exported",
          description: "Context exported to clipboard",
        });
      } else {
        const stringifiedResult =
          typeof result === "string" ? result : JSON.stringify(result, null, 2);

        navigator.clipboard.writeText(stringifiedResult);
        toast({
          title: "Context exported",
          description: "Context exported to clipboard",
        });
      }

      setOpen(false);
      setExportConfig({
        webId: webId as string,
        selectedSources: sources.map((s) => s.sourceId),
        asMarkdown: true,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error exporting context",
      });
    }
  };

  const handleSourceToggle = (sourceId: string) => {
    setExportConfig((prev) => {
      const isSelected = prev.selectedSources.includes(sourceId);
      return {
        ...prev,
        selectedSources: isSelected
          ? prev.selectedSources.filter((id) => id !== sourceId)
          : [...prev.selectedSources, sourceId],
      };
    });
  };

  const handleSelectAll = () => {
    const allSourceIds = sources.map((s) => s.sourceId);
    setExportConfig((prev) => ({
      ...prev,
      selectedSources: allSourceIds,
    }));
  };

  const handleDeselectAll = () => {
    setExportConfig((prev) => ({
      ...prev,
      selectedSources: [],
    }));
  };

  useEffect(() => {
    setExportConfig({
      webId: webId as string,
      selectedSources: sources.map((s) => s.sourceId),
      asMarkdown: true,
    });
  }, [sources, webId]);

  function ResponsiveDiv({ children }: { children: React.ReactNode }) {
    return isMobile ? <div>{children}</div> : <>{children}</>;
  }

  const content = (
    <ResponsiveDiv>
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-0 justify-between p-2">
        <div className="flex items-center justify-between md:justify-start space-x-4">
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="text-xs lg:text-sm"
            >
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeselectAll}
              className="text-xs lg:text-sm"
            >
              Deselect All
            </Button>
          </>

          <Button
            size="sm"
            onClick={handleExport}
            disabled={
              isExportPending || exportConfig.selectedSources.length === 0
            }
            className="flex items-center md:hidden text-xs border dark:bg-violet-400/30 dark:border-violet-200 dark:hover:bg-violet-400/40"
          >
            {isExportPending && isExportError
              ? "Exporting..."
              : `${exportConfig.asMarkdown ? "Download Markdown" : "Copy to Clipboard"}`}
          </Button>
        </div>

        <div className="flex flex-row w-full lg:w-auto justify-between lg:justify-start items-start lg:items-center gap-2">
          <Label htmlFor="connections" className="text-sm">
            Download as .md
          </Label>
          <Switch
            className="pl-0"
            defaultChecked={false}
            id="connections"
            checked={exportConfig.asMarkdown}
            onCheckedChange={(checked) =>
              setExportConfig((prev) => ({
                ...prev,
                asMarkdown: checked,
              }))
            }
          ></Switch>
        </div>
      </div>
      <Command className="bg-transparent no-scrollbar">
        <div className="mb-2">
          <CommandInput
            placeholder="Search sources..."
            className="bg-transparent h-10"
          />
        </div>

        <CommandList className="h-[50dvh] no-scroll-bg">
          <CommandEmpty className="text-muted-foreground">
            No context found to export.
          </CommandEmpty>
          <CommandGroup>
            {sources &&
              sources.map((source: Source, id: number) => (
                <CommandItem
                  key={id}
                  className="flex cursor-pointer items-center"
                  value={`${source.name}${id}`}
                >
                  <div className="flex items-center flex-1 space-x-2">
                    <Checkbox
                      id={source.sourceId}
                      checked={exportConfig.selectedSources.includes(
                        source.sourceId
                      )}
                      onCheckedChange={() =>
                        handleSourceToggle(source.sourceId)
                      }
                      className="mr-2"
                    />
                    <Label
                      htmlFor={source.sourceId}
                      className="flex-1 cursor-pointer"
                    >
                      {source.name}
                    </Label>
                  </div>
                </CommandItem>
              ))}
          </CommandGroup>
        </CommandList>
      </Command>
      <div className="flex lg:justify-end pt-6">
        <Button
          onClick={handleExport}
          disabled={
            isExportPending || exportConfig.selectedSources.length === 0
          }
          className="flex hidden md:block items-center border dark:bg-violet-400/30 dark:border-violet-200 dark:hover:bg-violet-400/40"
        >
          {isExportPending && isExportError
            ? "Exporting..."
            : `${exportConfig.asMarkdown ? "Download Markdown" : "Copy to Clipboard"}`}
          <FolderOutput size={16} className="ml-2" />
        </Button>
      </div>
    </ResponsiveDiv>
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
                  <FolderOutput size={20} />
                </Button>
              </DrawerTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Export Context</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DrawerContent className="lg:max-w-2xl no-scrollbar h-[95dvh]">
          <DrawerHeader className="mt-1 text-left pl-6">
            <DrawerTitle>Export Context</DrawerTitle>
            <DrawerDescription>
              Export context to use with any LLM.
            </DrawerDescription>
          </DrawerHeader>
          <Separator className="my-2" />
          <div className="p-4 pb-0">{content}</div>
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
                <FolderUp size={20} />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Export Context</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent className="lg:max-w-2xl no-scrollbar">
        {" "}
        <DialogTitle className="flex items-center">
          <FolderUp size={16} className="mr-2"></FolderUp>Export Context
        </DialogTitle>
        <DialogDescription>
          Export context to use with any LLM.
        </DialogDescription>
        <Separator />
        {content}
      </DialogContent>
    </Dialog>
  );
}

export default ExportContextModal;
