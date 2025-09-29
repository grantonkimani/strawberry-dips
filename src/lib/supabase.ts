import { createClient } from '@supabase/supabase-js'  

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key'

// Log configuration for debugging
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key configured:', !!supabaseAnonKey && supabaseAnonKey !== 'placeholder_key');

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
