import { useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import Graph from "@/components/terminal/Graph";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ConfigGraphModal from "@/components/terminal/ConfigGraphModal";
import { ConfigFormValues } from "@/types/article";
import { Button } from "@/components/ui/button";
import { Expand, Settings2 } from "lucide-react";
import { useRouter } from "next/router";
import { colorOptions } from "@/types/design";
import useMediaQuery from "@/hooks/general";

function Terminal() {
  const router = useRouter();
  const { topic, query } = router.query;
  const [limit, setLimit] = useState(50);
  const [config, setConfig] = useState<ConfigFormValues>({
    query: `${query ? query : ""}`,
    topic: `${topic ? topic : ""}`,
    enableSpydrSearch: false,
  });
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [graphColor, setGraphColor] = useState("#5ea4ff");
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{
        height: expanded ? "100vh" : "100vh",
        zIndex: expanded ? 50 : "auto",
      }}
      className={`bg-background p-1.5 text-xs shadow-md w-full ${
        expanded ? "fixed top-0 left-0 right-0 bottom-0" : ""
      }`}
    >
      <ResizablePanelGroup
        direction="horizontal"
        className="min-h-[200px] w-full"
      >
        <ResizablePanel
          defaultSize={expanded ? 100 : isMobile ? 100 : 80}
          className="relative"
        >
          <div className={`w-44 absolute right-3 top-3 bg-background`}>
            <Select
              defaultValue={String(limit)}
              onValueChange={(value: string) => setLimit(Number(value))}
              value={String(limit)}
            >
              <SelectTrigger className="z-60">
                <SelectValue placeholder="Limit" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="10">{10}</SelectItem>
                  <SelectItem value="20">{20}</SelectItem>
                  <SelectItem value="50">{50}</SelectItem>
                  <SelectItem value="100">{100}</SelectItem>
                  <SelectItem value="200000">All</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="absolute left-3 top-3 bg-background border rounded-md ">
            <Button variant={"outline"} onClick={() => setExpanded(!expanded)}>
              <Expand size={16} />
            </Button>
          </div>

          <div className="flex flex-row items-center justify-center gap-2 absolute right-3 top-14 ">
            <div className={`bg-background border rounded-md`}>
              <ConfigGraphModal setConfig={setConfig} />
            </div>
            <div className="bg-background border rounded-md">
              <Button variant={"outline"}>
                {" "}
                {/**TODO: pull this out and make it design configuratiosn for the graph */}
                <Settings2 size={16} />
              </Button>
            </div>
          </div>

          <div className="bg-muted h-full w-full whitespace-nowrap">
            <Graph
              limit={limit}
              config={config}
              setConfig={setConfig}
              color={graphColor}
            />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle className={`${expanded ? "hidden" : ""}`} />
        <ResizablePanel
          defaultSize={expanded ? 0 : isMobile ? 0 : 20}
          maxSize={isMobile ? 50 : 20}
        >
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel
              defaultSize={50}
              className="flex items-center justify-center border"
            >
              Drop articles here
            </ResizablePanel>
            <ResizableHandle
              className={`hidden lg:flex ${expanded ? "hidden" : ""}`}
            />
            <ResizablePanel
              defaultSize={50}
              className="flex items-center justify-center border"
            >
              article results are listed here
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default Terminal;
