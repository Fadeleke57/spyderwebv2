import withAuth from "@/hoc/withAuth";
import { useState, useEffect } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import SideBar from "@/components/terminal/SideBar";
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

function Terminal() {
  const [limit, setLimit] = useState(10);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 lg:p-24">
      <div
        style={{ height: "80vh" }}
        className="border border-border/50 rounded-xl bg-background p-1.5 text-xs shadow-md w-full"
      >
        <ResizablePanelGroup
          direction="horizontal"
          className="min-h-[200px] w-full rounded-xl border"
        >
          <ResizablePanel defaultSize={75} className="relative">
            <div className="w-44 absolute right-3 top-3 bg-background border rounded-md">
              <Select
                defaultValue={String(limit)}
                onValueChange={(value: string) => setLimit(Number(value))}
                value={String(limit)}
              >
                <SelectTrigger>
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
            <div className="absolute right-3 top-14 bg-background border rounded-md">
              <ConfigGraphModal />
            </div>

            <div className="bg-muted h-full w-full whitespace-nowrap">
              <Graph limit={limit} />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle className="hidden lg:flex" />
          <ResizablePanel
            defaultSize={25}
            maxSize={40}
            className="hidden lg:block"
          >
            <SideBar />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </main>
  );
}

export default withAuth(Terminal);
