import { WebCard } from "./WebCard";
import { useUser } from "@/context/UserContext";
import { useFetchWebById } from "@/hooks/webs";
import { Skeleton } from "../ui/skeleton";
import { SkeletonCard } from "../utility/SkeletonCard";

export function SearchResultCard({ webId }: { webId: string }) {
  const { data: web, isLoading: webLoading } = useFetchWebById(webId);
  const { user, userLoading } = useUser();

  if (!web) return null;

  if (webLoading || userLoading)
    return <Skeleton className="w-full h-[175px]" />;

  return <WebCard web={web} user={user}></WebCard>;
}
