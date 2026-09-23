import type { ReactNode } from 'react'

type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral' | 'brand'
type BadgeSize = 'sm' | 'md'

const STYLES: Record<BadgeVariant, string> = {
  success: 'bg-[var(--color-success-50)] text-[var(--color-success-700)]',
  warning: 'bg-[var(--color-warning-50)] text-[var(--color-warning-700)]',
  danger:  'bg-[var(--color-danger-50)] text-[var(--color-danger-700)]',
  neutral: 'bg-[var(--color-border-subtle)] text-[var(--color-text-secondary)]',
  brand:   'bg-[var(--color-brand-900)] text-[var(--color-brand-400)]',
}

const DOT_STYLES: Record<BadgeVariant, string> = {
  success: 'bg-[var(--color-success-500)]',
  warning: 'bg-[var(--color-warning-500)]',
  danger:  'bg-[var(--color-danger-500)]',
  neutral: 'bg-[var(--color-text-tertiary)]',
  brand:   'bg-[var(--color-brand-500)]',
}

interface BadgeProps {
  variant: BadgeVariant
  size?: BadgeSize
  dot?: boolean
  children: ReactNode
}

export function Badge({ variant, size = 'sm', dot = false, children }: BadgeProps) {
  const sizeClass = size === 'sm' ? 'text-[11px] px-1.5 py-0.5' : 'text-xs px-2 py-1'
  return (
    <span className={`inline-flex items-center gap-1 rounded-[var(--radius-sm)] font-mono font-medium uppercase tracking-wide ${STYLES[variant]} ${sizeClass}`}>
      {dot && <span className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${DOT_STYLES[variant]}`} />}
      {children}
    </span>
  )
}
