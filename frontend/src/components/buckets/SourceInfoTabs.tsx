import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BucketConfigFormValues } from "@/types/article";
import { useUser } from "@/context/UserContext";
import { SourceAsNode } from "@/types/source";

type SourceInfoTabsProps = {
  source: SourceAsNode;
  color?: string;
  config?: BucketConfigFormValues;
};
export function SourceInfoTabs({
  source,
}: SourceInfoTabsProps) {
  const { user } = useUser();
  return (
    <Tabs defaultValue="chart" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="chart">Chart</TabsTrigger>
      </TabsList>
      <TabsContent value="chart">
        {source?.name}
      </TabsContent>
    </Tabs>
  );
}
