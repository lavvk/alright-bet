import { cn } from "@/lib/utils";

export function Skeleton({
  className,
}: {
  className?: string;
}) {
  return <div className={cn("skeleton rounded-md", className)} />;
}

/** Card-shaped skeleton matching MarketCard / TrendingCard. */
export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="mt-4 h-5 w-full" />
      <Skeleton className="mt-2 h-5 w-3/4" />
      <Skeleton className="mt-5 h-1.5 w-full rounded-full" />
      <div className="mt-4 flex gap-3">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <Skeleton className="h-10 flex-1 rounded-xl" />
      </div>
    </div>
  );
}
