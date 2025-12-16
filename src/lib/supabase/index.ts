/**
 * Supabase exports
 * Centralizes all Supabase-related imports
 */

export { createClient as createBrowserClient } from './client'
export { createClient as createServerClient, createServiceClient } from './server'
export { updateSession } from './middleware'
