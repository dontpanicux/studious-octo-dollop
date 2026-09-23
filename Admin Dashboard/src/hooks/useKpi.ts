import { useEffect, useState } from 'react'
import { fetchKpiSummary } from '../lib/queries'
import { isSupabaseConfigured } from '../lib/supabase'
import type { KpiSummary } from '../types'

export function useKpi() {
  const [summary, setSummary] = useState<KpiSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured()) { setLoading(false); return }
    fetchKpiSummary()
      .then(d => { setSummary(d); setLoading(false) })
      .catch(e => { setError(e); setLoading(false) })
  }, [])

  return { summary, loading, error }
}
