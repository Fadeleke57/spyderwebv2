import { useFetchSource } from "@/hooks/sources";
import { Connection } from "@/types/connection";
import React, { useState } from "react";
import { Skeleton } from "../ui/skeleton";
import { ArrowLeft, ArrowRight, Cable, Sparkles, Trash } from "lucide-react";
import { useDeleteConnection } from "@/hooks/connections";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function ConnectionBlock({
  connection,
  type,
  isOwner,
  onSourceClick,
}: {
  connection: Connection;
  type: string;
  isOwner: boolean;
  onSourceClick: (sourceId: string) => void;
}) {
  const [deleted, setDeleted] = useState(false);

  const { data: fromSource, isLoading: fromLoading } = useFetchSource(
    connection.fromSourceId,
    "connection-block-from"
  );
  const { data: toSource, isLoading: toLoading } = useFetchSource(
    connection.toSourceId,
    "connection-block-to"
  );
  const { mutateAsync: deleteConnection, isPending: deleteConnectionLoading } =
    useDeleteConnection();

  if (fromLoading || toLoading)
    return <Skeleton className="h-16 w-full rounded-xl" />;

  const handleDeleteConnection = async (id: string) => {
    setDeleted(true);
    try {
      await deleteConnection(id);
    } catch (error) {
      console.error(error);
    }
  };

  if (deleted) return null;

  const handleSourceClick = () => {
    console.log("Connection block source clicked");
    console.log(
      type === "out" ? connection.toSourceId : connection.fromSourceId
    );
    onSourceClick(
      type === "out" ? connection.toSourceId : connection.fromSourceId
    );
  };

  return (
    <div className="border relative grid grid-cols-6 gap-4 rounded-lg p-2">
      {isOwner && (
        <Trash
          size={16}
          onClick={() => handleDeleteConnection(connection.connectionId)}
          className="absolute top-2 right-2 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted rounded-full"
        />
      )}
      <div className="col-span-3 h-full flex flex-col items-center justify-center gap-2 relative z-10">
        <div className="w-full">
          <h4 className="font-medium text-sm mb-1">Description:</h4>
          <p
            className="text-sm text-muted-foreground wrap [&_a]:text-violet-400 [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: connection.description }}
          />
        </div>
      </div>
      <div
        className={`col-span-1 flex items-center gap-0 flex-row justify-center ${type == "out" ? "" : "flex-row-reverse"}`}
      >
        {connection.aiGenerated ? (
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Sparkles size={20} className="text-violet-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Autolinked</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Cable size={20} className="text-violet-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Linked</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <div
        className="col-span-2 space-y-2 rounded-lg p-2 cursor-pointer hover:bg-muted/50"
        onClick={handleSourceClick}
      >
        {toLoading ? (
          <div className="flex items-center justify-center h-full">
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        ) : (
          <div className="break-words">
            <h4 className="font-medium text-sm mb-1">
              {type == "out" ? "Connecting to:" : "From:"}
            </h4>
            <p className="text-sm text-violet-400">
              {type == "out" ? toSource.result.name : fromSource.result.name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ConnectionBlock;
