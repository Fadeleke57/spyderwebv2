import React, { useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { OrbitIcon } from "lucide-react";
import { useCheckAutolinkerStatus } from "@/hooks/process";

function AutoLinkerIndicator({
  webId,
  sourceId,
}: {
  webId: string;
  sourceId: string;
}) {
  const { data: proccess, isLoading } = useCheckAutolinkerStatus(
    webId,
    sourceId
  );
  const [autoLinkerRunning, setAutoLinkerRunning] = React.useState(false);
  console;

  useEffect(() => {
    setAutoLinkerRunning(!!proccess);
  }, [proccess]);

  if (!autoLinkerRunning) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <OrbitIcon
            size={16}
            className={`text-violet-400 ${autoLinkerRunning ? "animate-spin-slow" : ""}`}
          />
        </TooltipTrigger>
        <TooltipContent>Charlie is running..</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default AutoLinkerIndicator;
