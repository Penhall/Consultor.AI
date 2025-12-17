/**
 * Supabase Configuration
 * Handles both legacy and new naming conventions
 */

// Get Supabase URL
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

// Get public key (supports both old and new naming)
export const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || // New naming (preferred)
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY           // Legacy naming

if (!supabaseAnonKey) {
  throw new Error(
    'Missing Supabase public key. Please set either:\n' +
    '- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (new naming), or\n' +
    '- NEXT_PUBLIC_SUPABASE_ANON_KEY (legacy naming)'
  )
}

// Get secret key (supports both old and new naming)
// This should only be used server-side
export const supabaseServiceRoleKey =
  process.env.SUPABASE_SECRET_KEY ||      // New naming (preferred)
  process.env.SUPABASE_SERVICE_ROLE_KEY   // Legacy naming

if (!supabaseServiceRoleKey) {
  console.warn(
    'Missing Supabase secret key. Server-side operations may fail.\n' +
    'Please set either:\n' +
    '- SUPABASE_SECRET_KEY (new naming), or\n' +
    '- SUPABASE_SERVICE_ROLE_KEY (legacy naming)'
  )
}

// Export for use in the app
export const supabaseConfig = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
  serviceRoleKey: supabaseServiceRoleKey,
}
