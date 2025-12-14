import { Lock } from 'lucide-react'
import type { PropsWithChildren } from 'react'

export function LockedOverlay({ children }: PropsWithChildren) {
  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-[2px] opacity-70">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/70">
        <div className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-sm font-medium">
          <Lock className="h-4 w-4" />
          PRO Locked
        </div>
      </div>
    </div>
  )
}
