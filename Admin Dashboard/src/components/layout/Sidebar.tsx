import { useContext, useState } from 'react'
import { NavigationContext } from '../../App'
import { runSeed } from '../../lib/seed'
import { supabase } from '../../lib/supabase'
import type { Page } from '../../types'

const NAV: { page: Page; label: string; icon: JSX.Element }[] = [
  {
    page: 'overview',
    label: 'Overview',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1" fill="currentColor" opacity="0.8" />
        <rect x="9" y="1" width="6" height="6" rx="1" fill="currentColor" opacity="0.4" />
        <rect x="1" y="9" width="6" height="6" rx="1" fill="currentColor" opacity="0.4" />
        <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" opacity="0.4" />
      </svg>
    ),
  },
  {
    page: 'revenue',
    label: 'Revenue',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 12L5.5 8L8.5 10L13 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 4h3v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    page: 'customers',
    label: 'Customers',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M1.5 13.5C1.5 11 3.5 9 6 9s4.5 2 4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="11.5" cy="5.5" r="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M13 9.5c1.1.6 2 1.8 2 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    page: 'pipeline',
    label: 'Pipeline',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="6" width="3" height="9" rx="0.5" fill="currentColor" opacity="0.35" />
        <rect x="5.5" y="4" width="3" height="11" rx="0.5" fill="currentColor" opacity="0.6" />
        <rect x="10" y="1" width="3" height="14" rx="0.5" fill="currentColor" opacity="0.9" />
        <rect x="14" y="3" width="1" height="12" rx="0.5" fill="currentColor" opacity="0.2" />
      </svg>
    ),
  },
]

export function Sidebar() {
  const { currentPage, navigate } = useContext(NavigationContext)
  const [seeding, setSeeding] = useState<'idle' | 'running' | 'done' | 'error'>('idle')

  async function handleSeed() {
    setSeeding('running')
    try {
      await runSeed(supabase)
      setSeeding('done')
      setTimeout(() => setSeeding('idle'), 3000)
      window.location.reload()
    } catch {
      setSeeding('error')
      setTimeout(() => setSeeding('idle'), 3000)
    }
  }

  return (
    <aside
      className="w-52 shrink-0 flex flex-col border-r border-[var(--color-border-subtle)]"
      style={{ background: 'var(--color-surface-sidebar)' }}
    >
      {/* Logo */}
      <div className="h-14 flex items-center gap-2.5 px-4 border-b border-[var(--color-border-subtle)]">
        <div className="w-7 h-7 rounded-[var(--radius-md)] bg-[var(--color-brand-500)] flex items-center justify-center shrink-0">
          <span className="font-mono font-medium text-sm text-[var(--color-text-inverse)]">M</span>
        </div>
        <span className="text-sm font-semibold tracking-tight text-[var(--color-text-primary)]">Meridian</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 flex flex-col gap-0.5">
        <p className="text-[10px] uppercase tracking-widest text-[var(--color-text-tertiary)] font-mono px-2 mb-2">Navigation</p>
        {NAV.map(({ page, label, icon }) => {
          const active = currentPage === page
          return (
            <button
              key={page}
              onClick={() => navigate(page)}
              className={`flex items-center gap-2.5 w-full px-2.5 py-2 rounded-[var(--radius-md)] text-sm transition-colors text-left ${
                active
                  ? 'bg-[var(--color-brand-900)] text-[var(--color-brand-400)]'
                  : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-overlay)]'
              }`}
            >
              {icon}
              <span className={`font-medium ${active ? 'text-[var(--color-text-brand)]' : ''}`}>{label}</span>
            </button>
          )
        })}
      </nav>

      {/* Seed button */}
      <div className="px-3 pb-2 border-t border-[var(--color-border-subtle)] pt-3">
        <button
          onClick={handleSeed}
          disabled={seeding === 'running'}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-[var(--radius-md)] text-[10px] font-mono font-medium transition-colors disabled:opacity-50"
          style={{
            background: seeding === 'done'
              ? 'var(--color-success-50)'
              : seeding === 'error'
              ? 'var(--color-danger-50)'
              : 'var(--color-surface-overlay)',
            color: seeding === 'done'
              ? 'var(--color-success-700)'
              : seeding === 'error'
              ? 'var(--color-danger-700)'
              : 'var(--color-text-tertiary)',
          }}
        >
          {seeding === 'running' && (
            <svg className="animate-spin" width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M5 1v2M5 7v2M1 5h2M7 5h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          )}
          {seeding === 'running' ? 'Seeding…' : seeding === 'done' ? '✓ Seeded' : seeding === 'error' ? '✗ Error' : 'Seed Demo Data'}
        </button>
      </div>

      {/* User pill */}
      <div className="p-3 border-t border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-2.5 px-1">
          <div className="w-7 h-7 rounded-full bg-[var(--color-brand-800)] flex items-center justify-center shrink-0">
            <span className="text-[10px] font-mono font-medium text-[var(--color-brand-300)]">JE</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-[var(--color-text-secondary)] truncate">Jordan Ellis</p>
            <p className="text-[10px] text-[var(--color-text-tertiary)] truncate">RevOps · Admin</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
