import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined

// Lazily create client only if envs are present so build doesn't fail
export const supabaseAdmin =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        global: {
          fetch: (url, options = {}) => {
            // Add timeout to prevent hanging requests
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
            
            return fetch(url, {
              ...options,
              signal: controller.signal,
            }).finally(() => {
              clearTimeout(timeoutId);
            });
          },
        },
      })
    : null

if (!supabaseAdmin) {
  console.warn('[supabaseAdmin] Missing envs: NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY')
} else {
  console.log('Supabase admin client initialized successfully');
}


