import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArticleChart } from "./ArticleChart";
import { ArticleAsNode, ConfigFormValues } from "@/types/article";
import { useFetchArticleRelevantSentences } from "@/hooks/articles";

interface DataDrawerProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  article: ArticleAsNode;
  color?: string;
  config?: ConfigFormValues;
}

export function DataDrawer({
  open,
  setOpen,
  article,
  color,
  config,
}: DataDrawerProps) {
  console.log("new query", config?.query);
  const { sentences, loading, error } = useFetchArticleRelevantSentences(
    article?.id || "",
    config?.query || ""
  );
  console.log("sentences", sentences);

  return (
    <div className="grid grid-cols-2 gap-2">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side={"left"} className="w-[400px] sm:w-[540px]">
          <SheetHeader className="border-b pb-4">
            <SheetTitle className="text-left w-[300px] lg:w-content">
              Article Insights
            </SheetTitle>
            <SheetDescription className="text-left pr-4">
              Using sentiment analysis, subjectivity analysis, and a customized
              relevance score to deliver data.
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col py-6 gap-4 h-[calc(90vh-1rem)] overflow-auto">
            <ArticleChart article={article} color={color} />
            {config?.query && (
              <div className="border rounded-lg">
                <ScrollArea className="h-40 p-4">
                  {!loading && (
                    <>
                      <h4 className="scroll-m-20 text-xl font-semibold tracking-tigh mb-4">
                        Mentions{" "}
                        <span className="font-bold text-blue-400">
                          &ldquo;{config?.query}&ldquo;
                        </span>
                        :
                      </h4>
                      <ul className="flex flex-col gap-2">
                        {sentences.map((sentence, index) => (
                          <li key={index} className="flex flex-row gap-2">
                            <p className="font-bold text-blue-400">
                              {index + 1}.
                            </p>
                            <p dangerouslySetInnerHTML={{ __html: sentence }} />
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  {loading && <p>Loading...</p>}
                </ScrollArea>
              </div>
            )}
          </div>
          <SheetFooter></SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
