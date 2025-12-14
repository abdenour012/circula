import { cn } from '../lib/cn'

export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl bg-black/5 anim-shimmer', className)} aria-hidden="true">
      &nbsp;
    </div>
  )
}

export function ScanSkeleton() {
  return (
    <div className="space-y-3 anim-fade-in">
      <LoadingSkeleton className="h-4 w-3/4" />
      <div className="grid grid-cols-3 gap-3">
        <LoadingSkeleton className="h-16" />
        <LoadingSkeleton className="h-16" />
        <LoadingSkeleton className="h-16" />
      </div>
    </div>
  )
}
