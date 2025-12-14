import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, Info, Loader2, X } from 'lucide-react'
import { cn } from '../lib/cn'
import { Button } from './Button'

type ToastType = 'success' | 'error' | 'info' | 'loading'

export function Toast({
  message,
  type = 'info',
  duration = 3000,
  onClose,
}: {
  message: string
  type?: ToastType
  duration?: number
  onClose?: () => void
}) {
  const [mounted, setMounted] = useState(true)

  useEffect(() => {
    if (type !== 'loading' && duration > 0) {
      const t = window.setTimeout(() => {
        setMounted(false)
        onClose?.()
      }, duration)
      return () => window.clearTimeout(t)
    }
  }, [duration, onClose, type])

  if (!mounted) return null

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-green-600" />,
    error: <XCircle className="h-5 w-5 text-[#DC2626]" />,
    info: <Info className="h-5 w-5 text-blue-600" />,
    loading: <Loader2 className="h-5 w-5 text-[#DC2626] animate-spin" />,
  }

  const styles = {
    success: 'bg-green-50 border-green-200 text-green-900',
    error: 'bg-red-50 border-red-200 text-red-900',
    info: 'bg-blue-50 border-blue-200 text-blue-900',
    loading: 'bg-white border-black/10 text-black',
  }

  return (
    <div
      className={cn(
        'anim-fade-up anim-stagger-1 fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4',
        'rounded-2xl border shadow-elevated backdrop-blur-sm',
        styles[type],
      )}
    >
      <div className="flex items-center gap-3 p-4">
        {icons[type]}
        <div className="flex-1 text-sm font-medium">{message}</div>
        {onClose && type !== 'loading' && (
          <Button size="sm" variant="ghost" onClick={onClose} className="h-6 w-6 p-0">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
