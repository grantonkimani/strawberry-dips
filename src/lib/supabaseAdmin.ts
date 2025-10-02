import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined

// Lazily create client only if envs are present so build doesn't fail
export const supabaseAdmin =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey)
    : null

if (!supabaseAdmin) {
  console.warn('[supabaseAdmin] Missing envs: NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY')
}


