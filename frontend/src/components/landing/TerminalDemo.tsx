import { useState } from "react";
import {
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import { ConfigFormValues } from "@/types/article";
import { Button } from "@/components/ui/button";
import GraphDemo from "./GraphDemo";
import { Search } from "lucide-react";

export default function TerminalDemo() {
  const [config, setConfig] = useState<ConfigFormValues>({
    query: "",
    topic: "",
  });

  return (
    <div
      style={{ height: "80vh" }}
      className="border border-border/50 rounded-xl bg-background p-1.5 text-xs shadow-md w-full"
    >
      <ResizablePanelGroup
        direction="horizontal"
        className="min-h-[200px] w-full rounded-xl border"
      >
        <ResizablePanel defaultSize={75} className="relative">
          <div className="absolute left-3 top-3 bg-background border rounded-md ">
            <Button>
              <Search size={16} />
            </Button>
          </div>

          <div className="bg-muted h-full w-full whitespace-nowrap">
            <GraphDemo limit={20} config={config} setConfig={setConfig} />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
