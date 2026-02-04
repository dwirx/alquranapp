import { Skeleton } from "@/components/ui/skeleton";

export function SurahCardSkeleton() {
  return (
    <div className="rounded-xl bg-card p-4 border border-border">
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-full shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
          <div className="mt-3 flex items-center gap-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AyatCardSkeleton() {
  return (
    <div className="rounded-xl bg-card border border-border p-4 md:p-6">
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>
      <div className="mb-6 text-right space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-3/4 ml-auto" />
      </div>
      <Skeleton className="h-4 w-full mb-3" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}
