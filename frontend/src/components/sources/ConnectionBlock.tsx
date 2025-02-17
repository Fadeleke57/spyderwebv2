import { useFetchSource } from "@/hooks/sources";
import { Connection } from "@/types/connection";
import React from "react";
import { Skeleton } from "../ui/skeleton";
import { ArrowLeft, ArrowRight, Loader2, Trash } from "lucide-react";
import { useDeleteConnection } from "@/hooks/connections";

function ConnectionBlock({
  connection,
  type,
  onDelete,
  isOwner,
}: {
  connection: Connection;
  type: string;
  onDelete?: () => void;
  isOwner: boolean;
}) {
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
    await deleteConnection(id);
    onDelete && onDelete();
  };

  return (
    <div className="border relative grid grid-cols-6 gap-4 rounded-lg p-2">
      {isOwner && <Trash
        size={16}
        onClick={() => handleDeleteConnection(connection.connectionId)}
        className="absolute top-2 right-2 cursor-pointer text-muted-foreground"
      />}
      <div className="col-span-3 h-full flex flex-col items-center justify-center gap-2 relative z-10">
        <div className="w-full ">
          <h4 className="font-medium">Description:</h4>
          <p className="text-sm text-muted-foreground wrap">
            {connection.data.description}
          </p>
        </div>
      </div>
      <div className="col-span-1 flex items-center justify-center pointer-events-none">
        {type == "out" ? (
          <ArrowRight strokeWidth={3} className="w-full" />
        ) : (
          <ArrowLeft strokeWidth={3} className="w-full" />
        )}
      </div>

      <div className="col-span-2 space-y-2 rounded-lg p-2">
        {toLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <div>
            <h4 className="font-medium">
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
