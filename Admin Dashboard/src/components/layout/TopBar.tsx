import { Avatar } from '../ui/Avatar'

interface TopBarProps {
  title: string
  subtitle?: string
}

const PAGE_DATE = new Date().toLocaleDateString('en-US', {
  weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
})

export function TopBar({ title, subtitle }: TopBarProps) {
  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-[var(--color-border-subtle)] shrink-0">
      <div>
        <h1 className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</h1>
        {subtitle && <p className="text-xs text-[var(--color-text-tertiary)]">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        <span className="text-xs font-mono text-[var(--color-text-tertiary)] hidden sm:block">{PAGE_DATE}</span>

        {/* Bell */}
        <button className="p-1.5 rounded-[var(--radius-md)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-overlay)] transition-colors relative">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 1.5a4.5 4.5 0 0 0-4.5 4.5v2.5L2 10v1h12v-1l-1.5-1.5V6A4.5 4.5 0 0 0 8 1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M6.5 11.5a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[var(--color-brand-500)]" />
        </button>

        <Avatar name="Jordan Ellis" size="sm" />
      </div>
    </header>
  )
}
