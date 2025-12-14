import type { PropsWithChildren } from 'react'
import { X } from 'lucide-react'
import { cn } from '../lib/cn'
import { Button } from './Button'

export function Modal({
  title,
  open,
  onClose,
  children,
  className,
}: PropsWithChildren<{ title: string; open: boolean; onClose: () => void; className?: string }>) {
  return (
    <div className={cn('fixed inset-0 z-50 transition-opacity duration-200', open ? 'opacity-100' : 'pointer-events-none opacity-0')} aria-hidden={!open}>
      <div
        className={cn('absolute inset-0 bg-black/40 transition-opacity duration-200', open ? 'opacity-100' : 'opacity-0')}
        onClick={onClose}
      />
      <div
        className={cn(
          'absolute inset-x-0 bottom-0 mx-auto w-full max-w-md rounded-t-3xl bg-white p-4 shadow-2xl',
          'transition-[transform,opacity] duration-200 ease-out will-change-transform',
          open ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold">{title}</div>
          <Button size="sm" variant="ghost" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className={cn('mt-3', className)}>{children}</div>
      </div>
    </div>
  )
}
