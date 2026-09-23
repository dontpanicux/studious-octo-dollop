import { useEffect, useState, useCallback } from 'react'
import { fetchCustomers } from '../lib/queries'
import { isSupabaseConfigured } from '../lib/supabase'
import type { Customer, CustomerFilters } from '../types'

export function useCustomers(filters: CustomerFilters = {}) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const key = JSON.stringify(filters)

  const fetch = useCallback(() => {
    if (!isSupabaseConfigured()) { setLoading(false); return }
    setLoading(true)
    fetchCustomers(filters)
      .then(d => { setCustomers(d); setLoading(false) })
      .catch(e => { setError(e); setLoading(false) })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  useEffect(() => { fetch() }, [fetch])

  return { customers, loading, error, refetch: fetch }
}
