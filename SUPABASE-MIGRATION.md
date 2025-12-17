# Supabase API Key Migration Guide

Supabase is migrating to clearer naming for API keys:

## Changes

| Old Name | New Name | Usage |
|----------|----------|-------|
| `anon` key | `publishable` key | Client-side, safe to expose |
| `service_role` key | `secret` key | Server-side only, NEVER expose |

## What This Means

### Before (Legacy)
```env
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJ...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJ...
```

### Now (New Naming)
```env
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
```

## Your Current Setup

Based on your Supabase dashboard, you have:

```env
NEXT_PUBLIC_SUPABASE_URL=https://qzljsendvthfetrntwab.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_015HqeK06ifEw0ksZMIgcA_jV1EUU1U
```

⚠️ **You still need to get your SECRET key from Supabase dashboard:**
1. Go to https://supabase.com/dashboard/project/qzljsendvthfetrntwab/settings/api
2. Look for "Secret Key" (or "service_role key" if using legacy UI)
3. Copy it and add to your `.env` file

## Compatibility

Our app supports **both** naming conventions:

- ✅ Old naming still works (`anon`, `service_role`)
- ✅ New naming preferred (`publishable`, `secret`)
- ✅ You can use either or both

The app will automatically:
1. Try the new naming first
2. Fall back to old naming if new not found
3. Show helpful error if neither is set

## Migration Steps

### Option 1: Use New Naming (Recommended)

Update your `.env`:

```env
# Remove or comment out old variables
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# SUPABASE_SERVICE_ROLE_KEY=...

# Use new variables
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_015HqeK06ifEw0ksZMIgcA_jV1EUU1U
SUPABASE_SECRET_KEY=sb_secret_YOUR_SECRET_KEY_HERE
```

### Option 2: Keep Both (Transitional)

Keep both for compatibility:

```env
# Legacy (for backwards compatibility)
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_015HqeK06ifEw0ksZMIgcA_jV1EUU1U
SUPABASE_SERVICE_ROLE_KEY=sb_secret_YOUR_SECRET_KEY_HERE

# New (preferred, takes precedence)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_015HqeK06ifEw0ksZMIgcA_jV1EUU1U
SUPABASE_SECRET_KEY=sb_secret_YOUR_SECRET_KEY_HERE
```

## Getting Your Keys

### From Supabase Dashboard

1. **Go to Project Settings**
   - https://supabase.com/dashboard/project/qzljsendvthfetrntwab/settings/api

2. **Copy Keys**
   - **Publishable Key** (Public): Safe to use in client-side code
   - **Secret Key** (Private): Use ONLY server-side, never expose

3. **Update Environment**
   ```bash
   # Edit .env file
   nano .env  # or use your editor

   # Add the keys
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   SUPABASE_SECRET_KEY=sb_secret_...
   ```

### From Supabase CLI (Local Development)

```bash
# Start local Supabase
supabase start

# It will output:
# API URL: http://localhost:54321
# Anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# Service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Use these in .env.local for local development
```

## Security Notes

### ✅ Safe to Expose (Publishable Key)
- Used in client-side code
- Included in browser bundles
- Protected by Row Level Security (RLS)
- Prefix: `sb_publishable_` or starts with `eyJ...`

### 🔒 NEVER Expose (Secret Key)
- Server-side only (API routes, Edge Functions)
- Bypasses Row Level Security
- Can access all data
- Prefix: `sb_secret_` or starts with `eyJ...`

## Code Examples

### Client Component (Browser)
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY! // ✅ OK to use
)
```

### Server Component / API Route
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY! // 🔒 Server-side only
)
```

## Verifying Your Setup

```bash
# Check if keys are set
echo $NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
echo $SUPABASE_SECRET_KEY

# Test connection
curl https://qzljsendvthfetrntwab.supabase.co/rest/v1/ \
  -H "apikey: sb_publishable_015HqeK06ifEw0ksZMIgcA_jV1EUU1U"
```

## Troubleshooting

### Error: "Missing Supabase public key"

**Solution**: Set either variable in `.env`:
```env
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
# OR
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJ...
```

### Error: "Missing Supabase secret key"

**Solution**: Set either variable in `.env`:
```env
SUPABASE_SECRET_KEY=sb_secret_...
# OR
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJ...
```

### Keys Not Working

1. **Check Supabase Project Status**
   - Is your project active?
   - Is it paused? (Free tier pauses after inactivity)

2. **Verify Keys are Correct**
   - Copy again from dashboard
   - Check for extra spaces/newlines

3. **Check Environment**
   - `.env` for Docker Compose
   - `.env.local` for local development
   - Vercel dashboard for production

## References

- [Supabase API Keys Documentation](https://supabase.com/docs/guides/api/api-keys)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Service Role Key Usage](https://supabase.com/docs/guides/api/using-service-key)

## Need Help?

Check `src/lib/supabase/config.ts` to see how the app handles both naming conventions.
