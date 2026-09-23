import { useEffect, useState, useCallback } from 'react'
import { fetchMrrTimeSeries } from '../lib/queries'
import { isSupabaseConfigured } from '../lib/supabase'
import type { MetricsDaily } from '../types'

export function useMetrics(days = 90) {
  const [data, setData] = useState<MetricsDaily[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetch = useCallback(() => {
    if (!isSupabaseConfigured()) { setLoading(false); return }
    setLoading(true)
    fetchMrrTimeSeries(days)
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setError(e); setLoading(false) })
  }, [days])

  useEffect(() => { fetch() }, [fetch])

  return { data, loading, error, refetch: fetch }
}
