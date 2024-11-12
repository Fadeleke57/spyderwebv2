import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonCard() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-[200px] w-[300px] rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[300px]" />
        <Skeleton className="h-4 w-[250px]" />
      </div>
    </div>
  );
}

export function SkeletonUserCard() {
  return (
    <div className="flex flex-row space-x-4 items-center justify-center">
      <div>
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <div>
        <Skeleton className="h-4 w-[100px]" />
      </div>
    </div>
  );
}

export function SkeletonTextCard() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-8 w-[350px] rounded-xl" />
      <Skeleton className="h-8 w-[350px] rounded-xl" />
      <Skeleton className="h-8 w-[350px] rounded-xl" />
      <Skeleton className="h-8 w-[350px] rounded-xl" />
      <Skeleton className="h-8 w-[350px] rounded-xl" />
      <Skeleton className="h-8 w-[350px] rounded-xl" />
      <Skeleton className="h-8 w-[350px] rounded-xl" />
      <Skeleton className="h-8 w-[350px] rounded-xl" />
    </div>
  );
}
