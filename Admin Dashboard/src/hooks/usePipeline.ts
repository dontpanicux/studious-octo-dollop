import { useEffect, useState } from 'react'
import { fetchPipeline, fetchPipelineByStage } from '../lib/queries'
import { isSupabaseConfigured } from '../lib/supabase'
import type { SalesDeal, DealStage } from '../types'

export function usePipeline() {
  const [deals, setDeals] = useState<SalesDeal[]>([])
  const [byStage, setByStage] = useState<Record<DealStage, { count: number; value: number }>>({} as never)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured()) { setLoading(false); return }
    Promise.all([fetchPipeline(), fetchPipelineByStage()])
      .then(([d, b]) => { setDeals(d); setByStage(b); setLoading(false) })
      .catch(e => { setError(e); setLoading(false) })
  }, [])

  return { deals, byStage, loading, error }
}
