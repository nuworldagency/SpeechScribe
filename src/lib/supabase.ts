import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

// Create a single supabase client for the entire session
export const createClient = () => {
  return createClientComponentClient<Database>({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  })
}

// Export a singleton instance
export const supabase = createClient()

// Legacy client (keep for compatibility)
export const supabaseClient = createClientComponentClient()
