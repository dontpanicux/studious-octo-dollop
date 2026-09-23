import { createContext, useState } from 'react'
import { isSupabaseConfigured } from './lib/supabase'
import { runSeed } from './lib/seed'
import { supabase } from './lib/supabase'
import { Shell } from './components/layout/Shell'
import { Overview } from './pages/Overview'
import { Revenue } from './pages/Revenue'
import { Customers } from './pages/Customers'
import { Pipeline } from './pages/Pipeline'
import type { Page } from './types'

interface NavigationContextValue {
  currentPage: Page
  navigate: (page: Page) => void
}

export const NavigationContext = createContext<NavigationContextValue>({
  currentPage: 'overview',
  navigate: () => {},
})

function SetupScreen() {
  const [seeding, setSeeding] = useState(false)
  const [seedDone, setSeedDone] = useState(false)
  const [seedError, setSeedError] = useState<string | null>(null)

  async function handleSeed() {
    setSeeding(true)
    setSeedError(null)
    try {
      await runSeed(supabase)
      setSeedDone(true)
    } catch (e) {
      setSeedError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setSeeding(false)
    }
  }

  const configured = isSupabaseConfigured()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8" style={{ background: 'var(--color-surface-base)' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--color-brand-500)] flex items-center justify-center">
            <span className="font-mono font-medium text-lg text-[var(--color-text-inverse)]">M</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">Meridian Analytics</p>
            <p className="text-xs text-[var(--color-text-tertiary)]">Internal RevOps Dashboard</p>
          </div>
        </div>

        {/* Setup card */}
        <div
          className="border border-[var(--color-border-default)] rounded-[var(--radius-xl)] p-6"
          style={{ background: 'var(--color-surface-raised)', boxShadow: 'var(--shadow-md)' }}
        >
          <h1 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">Connect Supabase</h1>
          <p className="text-xs text-[var(--color-text-tertiary)] mb-5">Add the following environment variables to your project.</p>

          <div className="space-y-3 mb-6">
            {[
              { name: 'VITE_SUPABASE_URL', example: 'https://xxxx.supabase.co' },
              { name: 'VITE_SUPABASE_ANON_KEY', example: 'eyJhbGci...' },
            ].map(({ name, example }) => (
              <div key={name} className="bg-[var(--color-surface-overlay)] rounded-[var(--radius-md)] p-3">
                <p className="font-mono text-xs text-[var(--color-text-brand)] mb-0.5">{name}</p>
                <p className="font-mono text-[10px] text-[var(--color-text-tertiary)]">{example}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-[var(--color-border-subtle)] pt-5">
            <p className="text-xs text-[var(--color-text-tertiary)] mb-3">
              Once connected, run the schema migration and seed your database with realistic demo data:
            </p>

            {!configured ? (
              <p className="text-xs font-mono text-[var(--color-text-tertiary)] bg-[var(--color-surface-overlay)] rounded-[var(--radius-md)] px-3 py-2">
                → Set env vars and refresh to seed
              </p>
            ) : seedDone ? (
              <div className="flex items-center gap-2 text-xs text-[var(--color-success-700)] bg-[var(--color-success-50)] rounded-[var(--radius-md)] px-3 py-2">
                <span>✓</span>
                <span>Database seeded successfully — refresh the page.</span>
              </div>
            ) : (
              <button
                onClick={handleSeed}
                disabled={seeding}
                className="w-full py-2 text-xs font-medium rounded-[var(--radius-md)] transition-colors disabled:opacity-50"
                style={{
                  background: 'var(--color-brand-500)',
                  color: 'var(--color-text-inverse)',
                }}
              >
                {seeding ? 'Seeding database…' : 'Seed Database with Demo Data'}
              </button>
            )}

            {seedError && (
              <p className="text-[10px] text-[var(--color-danger-700)] mt-2 font-mono">{seedError}</p>
            )}
          </div>
        </div>

        <p className="text-[10px] text-[var(--color-text-tertiary)] font-mono text-center mt-6">
          Run <span className="text-[var(--color-text-brand)]">supabase/migrations/001_schema.sql</span> in your Supabase SQL editor first
        </p>
      </div>
    </div>
  )
}

export default function App() {
  const [currentPage, setPage] = useState<Page>('overview')

  if (!isSupabaseConfigured()) {
    return <SetupScreen />
  }

  return (
    <NavigationContext.Provider value={{ currentPage, navigate: setPage }}>
      <Shell>
        {currentPage === 'overview' && <Overview />}
        {currentPage === 'revenue' && <Revenue />}
        {currentPage === 'customers' && <Customers />}
        {currentPage === 'pipeline' && <Pipeline />}
      </Shell>
    </NavigationContext.Provider>
  )
}
