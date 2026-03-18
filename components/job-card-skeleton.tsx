// components/job-card-skeleton.tsx

export function JobCardSkeleton() {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-5 animate-pulse">
      {/* Top right placeholder */}
      <div className="absolute top-4 right-4 h-4 w-16 rounded bg-secondary" />

      {/* Company logo and info */}
      <div className="mb-4 flex items-start gap-3">
        <div className="size-12 shrink-0 rounded-lg bg-secondary" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 w-3/4 rounded bg-secondary" />
          <div className="h-3 w-1/2 rounded bg-secondary" />
        </div>
      </div>

      {/* Location and badge */}
      <div className="mb-3 flex gap-2">
        <div className="h-4 w-24 rounded bg-secondary" />
        <div className="h-4 w-16 rounded bg-secondary" />
      </div>

      {/* Salary */}
      <div className="mb-3 h-4 w-32 rounded bg-secondary" />

      {/* Summary lines */}
      <div className="mb-4 space-y-2 flex-1">
        <div className="h-3 w-full rounded bg-secondary" />
        <div className="h-3 w-5/6 rounded bg-secondary" />
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <div className="h-8 flex-1 rounded-md bg-secondary" />
        <div className="h-8 flex-1 rounded-md bg-secondary" />
      </div>
    </div>
  )
}

export function JobCardSkeletonGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="relative">
          <JobCardSkeleton />
        </div>
      ))}
    </div>
  )
}