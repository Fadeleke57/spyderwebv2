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
import { ConfigFormValues, Article } from "@/types/article";
import { Button } from "@/components/ui/button";
import { Expand, Settings2 } from "lucide-react";
import { useRouter } from "next/router";
import { colorOptions } from "@/types/design";
import useMediaQuery from "@/hooks/general";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { formatText } from "@/lib/utils";
import WordFadeIn from "@/components/ui/word-fade-in";

function Terminal() {
  const router = useRouter();
  const { topic, query } = router.query;
  const [fetchedArticles, setFetchedArticles] = useState<Article[]>([]);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
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
        <ResizablePanel defaultSize={70} className="relative">
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
              fetchedArticles={fetchedArticles}
              setFetchedArticles={setFetchedArticles}
              selectedArticleId={selectedArticleId}
              setSelectedArticleId={setSelectedArticleId}
            />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle className={`${expanded ? "hidden" : ""}`} />
        <ResizablePanel defaultSize={30} maxSize={50}>
          <ScrollArea className="relative p-6 w-full rounded-md flex-col h-screen">
            <div className="max-w-3xl mx-auto font-sans space-y-4">
              <div>
                <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                  Results
                </h3>
              </div>
              <div className="space-y-4">
                {fetchedArticles.length &&
                  fetchedArticles.map((article, index) => {
                    const formattedHeader = formatText(
                      article.header || "Loading...",
                      70
                    );
                    const formattedLink = formatText(
                      article.link || "Loading...",
                      70
                    );
                    return (
                      <div key={index} className="max-w-2xl">
                        <div
                          className=""
                          onClick={() => setSelectedArticleId(article.id)}
                        >
                          <WordFadeIn
                            words={formattedHeader}
                            className={`text-left text-base font-medium ${selectedArticleId === article.id ? "text-purple-500" : "text-blue-700"} cursor-pointer duration-00 transition ease-in`}
                          />
                        </div>
                        <Link href={article.link} target="_blank">
                          <WordFadeIn
                            words={formattedLink}
                            className="text-left mt-1 text-sm text-muted-foreground group-hover:underline transition duration-1000 hover:underline"
                          />
                        </Link>
                      </div>
                    );
                  })}
              </div>
            </div>
          </ScrollArea>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default Terminal;
