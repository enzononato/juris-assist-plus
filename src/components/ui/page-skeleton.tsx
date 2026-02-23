import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Stat card skeleton ───────────────────────────────────────────────────────
export function StatSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={cn("grid gap-3", count === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-3")}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl border p-3.5">
          <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── List item skeleton ───────────────────────────────────────────────────────
export function ListItemSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-xl border bg-card p-4 animate-in fade-in duration-300"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <Skeleton className="h-10 w-1 rounded-full shrink-0 hidden sm:block" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-64" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-1.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-4 w-4 rounded shrink-0" />
        </div>
      ))}
    </div>
  );
}

// ─── Grid card skeleton ───────────────────────────────────────────────────────
export function GridCardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col rounded-xl border bg-card overflow-hidden animate-in fade-in duration-300"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <Skeleton className="h-1.5 w-full" />
          <div className="p-4 space-y-3">
            <div className="flex justify-between">
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <Skeleton className="h-3 w-40" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="border-t pt-2 flex justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Task skeleton ────────────────────────────────────────────────────────────
export function TaskSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-start gap-3 rounded-xl border bg-card p-4 animate-in fade-in duration-300"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <Skeleton className="h-4 w-4 rounded-full mt-0.5 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex items-start gap-2">
              <Skeleton className="h-2 w-2 rounded-full mt-2 shrink-0" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-3 w-48 ml-4" />
            <div className="flex gap-2 ml-4">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-3 w-36 ml-4" />
          </div>
          <Skeleton className="h-7 w-[120px] rounded-lg shrink-0" />
        </div>
      ))}
    </div>
  );
}

// ─── Calendar skeleton ────────────────────────────────────────────────────────
export function CalendarSkeleton() {
  return (
    <div className="animate-in fade-in duration-300">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-6 rounded" />
        ))}
      </div>
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-lg border p-1">
            <Skeleton className="h-4 w-4 mb-1" />
            {i % 4 === 0 && <Skeleton className="h-2 w-full rounded-sm mt-1" />}
            {i % 5 === 0 && <Skeleton className="h-2 w-3/4 rounded-sm mt-0.5" />}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Header skeleton ──────────────────────────────────────────────────────────
export function HeaderSkeleton() {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-28 rounded-xl" />
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>
    </div>
  );
}

// ─── Tabs skeleton ────────────────────────────────────────────────────────────
export function TabsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="mb-5 flex gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-28 rounded-lg" />
      ))}
    </div>
  );
}

// ─── Filters skeleton ─────────────────────────────────────────────────────────
export function FiltersSkeleton() {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
      <Skeleton className="h-9 flex-1 rounded-lg" />
      <div className="flex gap-2">
        <Skeleton className="h-9 w-[140px] rounded-lg" />
        <Skeleton className="h-9 w-[150px] rounded-lg" />
      </div>
    </div>
  );
}
