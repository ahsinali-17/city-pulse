import { Skeleton } from "@/components/ui/skeleton";

export default function FieldLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-3.5 w-60" />
        </div>
        <Skeleton className="h-7 w-20 rounded-full" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-10" />
        </div>
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-10" />
        </div>
      </div>

      {/* Task Cards Skeleton */}
      <div className="space-y-3">
        {[1, 2, 3].map((card) => (
          <div
            key={card}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3"
          >
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-3 w-3/4" />
            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
