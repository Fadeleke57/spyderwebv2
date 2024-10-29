import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NotesTab from "./NotesTab";
import { ArticleAsNode, BucketConfigFormValues } from "@/types/article";
import { SourceChart } from "./SourceChart";
import { useUser } from "@/context/UserContext";

type SourceInfoTabsProps = {
  source: ArticleAsNode;
  color?: string;
  config?: BucketConfigFormValues;
};
export function SourceInfoTabs({
  source,
  color,
  config,
}: SourceInfoTabsProps) {
  const { user } = useUser();
  return (
    <Tabs defaultValue="chart" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="chart">Chart</TabsTrigger>
        <TabsTrigger value="notes">Notes</TabsTrigger>
      </TabsList>
      <TabsContent value="notes">
        <NotesTab
          article={source}
          loading={false}
        />
      </TabsContent>
      <TabsContent value="chart">
        <SourceChart article={source} color={color} />
      </TabsContent>
    </Tabs>
  );
}
