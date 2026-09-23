import type { ReactNode } from 'react'

interface CardProps {
  title?: string
  subtitle?: string
  action?: ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
  className?: string
  children: ReactNode
}

const PAD = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' }

export function Card({ title, subtitle, action, padding = 'md', className = '', children }: CardProps) {
  return (
    <div
      className={`bg-[var(--color-surface-raised)] border border-[var(--color-border-subtle)] rounded-[var(--radius-lg)] ${className}`}
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      {(title || action) && (
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-[var(--color-border-subtle)]">
          <div>
            {title && <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</h3>}
            {subtitle && <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0 ml-4">{action}</div>}
        </div>
      )}
      <div className={PAD[padding]}>{children}</div>
    </div>
  )
}
