import { useCreateConnection } from "@/hooks/connections";
import { CreateConnection } from "@/types/connection";
import React, { useEffect, useState } from "react";
import { Textarea } from "../ui/textarea";
import { toast } from "../ui/use-toast";
import { ArrowRight, Loader2 } from "lucide-react";
import { useFetchSource } from "@/hooks/sources";
import { Button } from "../ui/button";

interface CreateConnectionBlockProps {
  fromSourceId: string;
  toSourceId: string;
  bucketId: string;
  setCreateConnectionVisible: (arg: boolean) => void;
  onConnectionCreated?: () => void;
}

function CreateConnectionBlock({
  fromSourceId,
  toSourceId,
  bucketId,
  setCreateConnectionVisible,
  onConnectionCreated,
}: CreateConnectionBlockProps) {
  const {
    mutateAsync: createConnection,
    isPending: createConnectionLoading,
    error: createConnectionError,
  } = useCreateConnection();

  const { data: fetchedToSource, isLoading: toSourceLoading } = useFetchSource(
    toSourceId,
    "create-connection-block"
  );

  const [toSourceData, setToSourceData] = useState<any>(null);
  const [config, setConfig] = useState<CreateConnection>({
    bucketId,
    fromSourceId,
    toSourceId,
    data: {
      description: "",
    },
  });

  useEffect(() => {
    if (fetchedToSource) {
      setToSourceData(fetchedToSource);
    }
  }, [fetchedToSource]);

  useEffect(() => {
    setConfig((prev) => ({
      ...prev,
      toSourceId,
    }));
  }, [toSourceId]);

  const handleCreateConnection = async () => {
    if (!config.data.description.trim()) {
      toast({
        title: "Error",
        description: "Please add a description for the connection",
        variant: "destructive",
      });
      return;
    }

    try {
      await createConnection(config);
      onConnectionCreated?.();
      setCreateConnectionVisible(false);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to create connection",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative grid grid-cols-6 gap-4 border rounded-lg p-4">
      <div className="col-span-3 h-full flex flex-col gap-2 relative z-10">
        <Textarea
          className="h-full w-full rounded-lg"
          rows={7}
          value={config.data.description}
          onChange={(e) =>
            setConfig({
              ...config,
              data: { ...config.data, description: e.target.value },
            })
          }
          placeholder="A brief description of the connection..."
        />
        <Button
          onClick={handleCreateConnection}
          disabled={createConnectionLoading || !config.data.description.trim()}
          className="w-full"
        >
          {createConnectionLoading ? (
            <Loader2 className="animate-spin mr-2" />
          ) : (
            "Create Connection"
          )}
        </Button>
      </div>
      <div className="col-span-1 flex items-center justify-center pointer-events-none">
        <ArrowRight strokeWidth={3} className="w-full" />
      </div>
      <div className="col-span-2 space-y-2 border rounded-lg p-2">
        {toSourceLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <div>
            <h4 className="font-medium">Connecting to:</h4>
            <p className="text-sm text-muted-foreground">
              {toSourceData?.result?.name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateConnectionBlock;
