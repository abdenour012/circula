import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../lib/cn'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'pro'
  size?: 'sm' | 'md'
}

export function Button({
  className,
  variant = 'secondary',
  size = 'md',
  ...props
}: Props) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl border px-4 font-medium outline-none transition-all duration-300 ease-out active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group'

  const sizes = {
    sm: 'h-9 text-sm',
    md: 'h-11 text-sm',
  }[size]

  const variants = {
    primary:
      'border-[#DC2626] bg-[#DC2626] text-white hover:bg-[#b91c1c] hover:shadow-glow-red hover:border-[#b91c1c] focus-visible:ring-[#DC2626] hover:scale-[1.02]',
    secondary:
      'border-black/10 bg-white text-black hover:bg-black/5 hover:shadow-modern-hover hover:border-black/15 focus-visible:ring-black/20 hover:scale-[1.01]',
    ghost:
      'border-transparent bg-transparent text-black hover:bg-black/5 focus-visible:ring-black/20 hover:scale-[1.01]',
    pro: 'border-black bg-black text-white hover:bg-black/90 hover:shadow-glow-black hover:scale-[1.02] focus-visible:ring-black/40',
  }[variant]

  return (
    <button className={cn(base, sizes, variants, className)} {...props}>
      <span className="relative z-10">{props.children}</span>
      <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full" />
    </button>
  )
}
