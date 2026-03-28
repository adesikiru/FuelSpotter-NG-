import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const isPlaceholder = (s?: string) => !s || s.includes('your-supabase')

export const supabase = (() => {
  if (isPlaceholder(supabaseUrl) || isPlaceholder(supabaseAnonKey)) {
    return null
  }
  try {
    return createClient(supabaseUrl!, supabaseAnonKey!)
  } catch (err) {
    console.error('Supabase initialization error:', err)
    return null
  }
})()