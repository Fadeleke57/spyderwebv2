import { useFetchSource } from "@/hooks/sources";
import { Connection } from "@/types/connection";
import React, { useState } from "react";
import { Skeleton } from "../ui/skeleton";
import { motion } from "framer-motion";
import { Cable, Loader2, Sparkles, Trash } from "lucide-react";
import { useDeleteConnection } from "@/hooks/connections";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "../ui/button";
import SimpleTooltip from "../utility/SimpleTooltip";
import { useSourceStore } from "@/store/sourceStore";

function ConnectionBlock({
  connection,
  type,
  isOwner,
  onConnectionDeleted,
}: {
  connection: Connection;
  type: string;
  isOwner: boolean;
  onConnectionDeleted?: () => void;
}) {
  const { setSelectedSourceId } = useSourceStore();
  const [isHovering, setIsHovering] = useState(false);

  const {
    data: fromSource,
    isLoading: fromLoading,
    refetch: refetchFromSource,
  } = useFetchSource(connection.fromSourceId, "connection-block-from");

  const {
    data: toSource,
    isLoading: toLoading,
    refetch: refetchToSource,
  } = useFetchSource(connection.toSourceId, "connection-block-to");

  const {
    mutateAsync: deleteConnection,
    isPending: deleteConnectionLoading,
    error: deleteConnectionError,
  } = useDeleteConnection();

  if (fromLoading || toLoading)
    return <Skeleton className="h-16 w-full rounded-xl" />;

  const handleDelete = async (id: string) => {
    try {
      await deleteConnection(id);
      onConnectionDeleted && onConnectionDeleted();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0, margin: 0, padding: 0 }}
      transition={{ duration: 0.2 }}
      className="border relative grid grid-cols-6 gap-4 rounded-lg p-2 font-mono overflow-hidden"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {isOwner && (
        <SimpleTooltip content="Delete Connection">
          <Button
            onClick={() => handleDelete(connection.connectionId)}
            size={"icon"}
            className={`absolute top-2 right-2 z-20 w-6 h-6 ${isHovering ? "opacity-100" : "opacity-0"} transition-opacity ease-in hover:bg-red-400/80`}
            disabled={deleteConnectionLoading}
          >
            {deleteConnectionLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Trash size={16} />
            )}
          </Button>
        </SimpleTooltip>
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
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <div className="relative">
                <Cable size={20} className="text-violet-400" />
                {connection.aiGenerated && (
                  <Sparkles
                    size={12}
                    className="absolute -top-2 -right-2 text-violet-400"
                  />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{connection.aiGenerated ? "Autolinked" : "Linked"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="col-span-2 space-y-2 rounded-lg p-2 cursor-pointer hover:bg-muted/50">
        {toLoading ? (
          <div className="flex items-center justify-center h-full">
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        ) : (
          <div
            className="break-words"
            onClick={() =>
              setSelectedSourceId(
                type == "out" ? connection.toSourceId : connection.fromSourceId
              )
            }
          >
            <h4 className="font-medium text-sm mb-1">
              {type == "out" ? "Connecting to:" : "Connecting from:"}
            </h4>
            <p className="text-sm text-violet-400">
              {type == "out" ? toSource.result.name : fromSource.result.name}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default ConnectionBlock;
