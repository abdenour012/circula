import type { PropsWithChildren } from 'react'
import { cn } from '../lib/cn'

type Props = PropsWithChildren<{
  className?: string
}>

export function Card({ className, children }: Props) {
  return (
    <div
      className={cn(
        'rounded-3xl border-2 border-black/5 bg-white/98 backdrop-blur-sm p-5 shadow-modern motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-out hover:shadow-modern-hover hover:scale-[1.005] hover:border-black/10',
        className,
      )}
    >
      {children}
    </div>
  )
}
