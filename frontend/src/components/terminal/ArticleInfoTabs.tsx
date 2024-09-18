import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArticleChart } from "./ArticleChart";
import Mentions from "./Mentions";
import { ArticleAsNode } from "@/types/article";
import { ConfigFormValues } from "@/types/article";
import { useFetchArticleRelevantSentences } from "@/hooks/articles";

type ArticleInfoTabsProps = {
  article: ArticleAsNode;
  color?: string;
  config?: ConfigFormValues;
};
export function ArticleInfoTabs({
  article,
  color,
  config,
}: ArticleInfoTabsProps) {
  const { sentences, loading, error } = useFetchArticleRelevantSentences(
    article?.id || "",
    config?.query || ""
  );
  return (
    <Tabs defaultValue="chart" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="chart">Chart</TabsTrigger>
        <TabsTrigger value="mentions">Mentions</TabsTrigger>
      </TabsList>
      <TabsContent value="mentions">
        <Mentions
          article={article}
          query={config?.query || ""}
          sentences={sentences}
          loading={loading}
        />
      </TabsContent>
      <TabsContent value="chart">
        <ArticleChart article={article} color={color} />
      </TabsContent>
    </Tabs>
  );
}
