import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

function SimpleTooltip({
  children,
  content,
  side,
  sideOffset,
  p,
}: {
  children: React.ReactNode;
  content: string | React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  p?: number;
}) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          sideOffset={sideOffset || 4}
          side={side || "top"}
          className={`max-w-xs p-${p || 4}`}
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default SimpleTooltip;
