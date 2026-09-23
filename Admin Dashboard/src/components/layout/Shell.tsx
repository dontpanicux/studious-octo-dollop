import type { ReactNode } from 'react'
import { useContext } from 'react'
import { NavigationContext } from '../../App'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

const PAGE_TITLE: Record<string, { title: string; subtitle: string }> = {
  overview: { title: 'Overview', subtitle: 'Meridian Analytics · RevOps Dashboard' },
  revenue: { title: 'Revenue', subtitle: 'MRR analysis & subscription events' },
  customers: { title: 'Customers', subtitle: 'Account health & lifecycle management' },
  pipeline: { title: 'Pipeline', subtitle: 'Sales funnel & deal tracking' },
}

interface ShellProps {
  children: ReactNode
}

export function Shell({ children }: ShellProps) {
  const { currentPage } = useContext(NavigationContext)
  const meta = PAGE_TITLE[currentPage] ?? PAGE_TITLE.overview

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-surface-base)' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar title={meta.title} subtitle={meta.subtitle} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
