import React, { useState } from "react";
import { Source } from "@/types/source";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import FaviconDisplay from "../utility/FaviconDisplay";
import { getTypeIcon } from "../chat/genui/graphcontext";
import { formatText } from "@/lib/utils";
import { formatFileSize } from "./SourceToolTip";
import { Skeleton } from "../ui/skeleton";
import SimpleTooltip from "../utility/SimpleTooltip";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { useSourceStore } from "@/store/sourceStore";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuthorization } from "@/providers/AuthorizationProvider";

interface SourceListViewProps {
  sources: Source[];
  onSourceClick: (sourceId: string) => void;
  sourcesLoading: boolean;
}

const SourceListView: React.FC<SourceListViewProps> = ({
  sources,
  onSourceClick,
  sourcesLoading,
}) => {
  const { isUploadingSource, setIsUploadingSource } = useSourceStore();
  const [addIconOrientation, setAddIconOrientation] = useState<number>(0);
  const isMobile = useIsMobile();
  const { canWrite } = useAuthorization();

  const handleOrientationChange = (open: boolean) => {
    setAddIconOrientation(open ? 45 : -45);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes == 0) {
      return "Just now";
    }
    if (minutes < 60) {
      return `${minutes} minutes ago`;
    } else if (hours < 24) {
      return `${hours} hours ago`;
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return new Date(date).toLocaleDateString();
    }
  };

  if (sourcesLoading) {
    return (
      <div className="px-2">
        {Array.from({ length: 10 }).map((_, index) => (
          <Skeleton key={index} className="h-7 mb-2 w-full" />
        ))}
      </div>
    );
  }

  if (!sources || sources.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No sources available.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end justify-end">
      {canWrite && (
        <SimpleTooltip content="Add memory" side="left">
          <Button
            size={"icon"}
            onClick={() => {
              handleOrientationChange(!isUploadingSource);
              setIsUploadingSource(!isUploadingSource);
            }}
            className="dark:bg-violet-400/40 dark:hover:bg-violet-400/50 rounded-lg p-1 px-4 h-fit w-fit "
          >
            Add
            <Plus
              strokeWidth={2}
              size={16}
              className={`rotate-${addIconOrientation} transition-transform ease-in-out duration-300 ml-2`}
            />
          </Button>
        </SimpleTooltip>
      )}
      <ScrollArea className="h-[65dvh] lg:h-[74dvh] w-full">
        <div className="p-4 pt-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[50px]"></TableHead>
                <TableHead className="font-medium">Name</TableHead>
                {!isMobile && (
                  <>
                    <TableHead className="font-medium lg:w-[200px]">
                      Modified
                    </TableHead>
                    <TableHead className="font-medium lg:w-[200px]">
                      Type
                    </TableHead>
                    <TableHead className="font-medium lg:w-[200px]">
                      Size
                    </TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sources.map((source) => (
                <TableRow
                  key={source.sourceId}
                  className="hover:bg-muted/50 cursor-pointer group"
                  onClick={() => onSourceClick(source.sourceId)}
                >
                  <TableCell className="w-[50px]">
                    <div className="flex items-center">
                      {source.type === "website" ||
                      source.type === "youtube" ? (
                        <FaviconDisplay url={source.url} />
                      ) : source.type ? (
                        getTypeIcon(source.type)
                      ) : null}
                    </div>
                  </TableCell>

                  <TableCell className="font-medium ">
                    <div className="flex items-center gap-2">
                      <span className="truncate max-w-[300px]">
                        {formatText(source.name, isMobile ? 20 : 30)}
                      </span>
                    </div>
                  </TableCell>

                  {!isMobile && (
                    <>
                      <TableCell className="text-muted-foreground lg:w-[200px]">
                        <span className="text-sm">
                          {formatDate(source.updated)}
                        </span>
                      </TableCell>

                      <TableCell className="text-muted-foreground lg:w-[200px]">
                        <span className="text-sm">
                          {source.type[0].toUpperCase() + source.type.slice(1)}
                        </span>
                      </TableCell>

                      <TableCell className="text-muted-foreground lg:w-[200px]">
                        <span className="text-sm">
                          {formatFileSize(source.size)}
                        </span>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </div>
  );
};

export default SourceListView;
