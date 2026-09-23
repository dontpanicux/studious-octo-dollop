import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mb-4 opacity-30">
        <rect x="6" y="8" width="36" height="32" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M14 18h20M14 24h12M14 30h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <p className="text-sm font-medium text-[var(--color-text-secondary)]">{title}</p>
      {description && <p className="text-xs text-[var(--color-text-tertiary)] mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
