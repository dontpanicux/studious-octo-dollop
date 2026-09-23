import { createClient } from '@supabase/supabase-js'
import { projectId, publicAnonKey } from '../../utils/supabase/info'

// Use env vars if explicitly set, otherwise fall back to Make's auto-generated info
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)
  ?? `https://${projectId}.supabase.co`
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)
  ?? publicAnonKey

export function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    projectId &&
    projectId !== 'your-project-id'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
