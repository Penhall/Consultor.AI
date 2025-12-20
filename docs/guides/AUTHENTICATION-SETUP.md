# Authentication System - Consultor.AI

Complete guide for the authentication system implemented with Supabase Auth.

## 📋 Overview

The authentication system provides:
- ✅ User registration with consultant profile creation
- ✅ Email/password login
- ✅ Password recovery (forgot password)
- ✅ Password reset
- ✅ Route protection via middleware
- ✅ Authentication state management via React hook
- ✅ Logout functionality
- ✅ Automatic consultant profile creation on signup

## 🏗️ Architecture

### Pages Structure

```
src/app/auth/
├── layout.tsx              # Auth pages layout (clean, centered)
├── login/
│   └── page.tsx            # Login page
├── register/
│   └── page.tsx            # Registration page
├── forgot-password/
│   └── page.tsx            # Request password reset
└── reset-password/
    └── page.tsx            # Reset password (from email link)
```

### Components

```
src/components/auth/
├── LogoutButton.tsx        # Reusable logout button
└── UserMenu.tsx            # User menu with profile info and logout
```

### Hooks

```
src/hooks/
└── useAuth.ts              # Authentication state management
```

### Middleware

```
src/middleware.ts           # Route protection and redirects
```

## 🔐 Authentication Flow

### 1. Registration (`/auth/register`)

**What happens:**
1. User fills registration form (name, email, WhatsApp, password)
2. Form validation with Zod schema
3. Create Supabase Auth user
4. Automatically create consultant profile in database
5. Redirect to login with success message

**Fields:**
- Name (min 2 characters)
- Email (valid email format)
- WhatsApp (international format: +5511999999999)
- Password (min 6 characters)
- Confirm Password (must match)

**Validation:**
```typescript
const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  whatsappNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Número de WhatsApp inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
})
```

**Consultant Profile Created:**
```typescript
{
  user_id: authUser.id,
  email: formData.email,
  name: formData.name,
  whatsapp_number: formData.whatsappNumber,
  slug: 'generated-from-email',
  vertical: 'saude',
  subscription_tier: 'freemium',
  monthly_lead_limit: 20,
}
```

### 2. Login (`/auth/login`)

**What happens:**
1. User enters email and password
2. Form validation with Zod
3. Supabase Auth sign in
4. Redirect to dashboard (or original destination if redirected from protected route)

**Features:**
- Remember redirect URL (via `?redirect=` query param)
- Show success message from registration
- Link to forgot password
- Link to register

### 3. Password Recovery (`/auth/forgot-password`)

**What happens:**
1. User enters email
2. Supabase sends password reset email
3. Email contains link to `/auth/reset-password`
4. Success message shown after email sent

**Email Configuration:**
- Email template configured in Supabase Auth settings
- Link redirects to: `${SITE_URL}/auth/reset-password`

### 4. Password Reset (`/auth/reset-password`)

**What happens:**
1. User clicks link from email
2. Token validated by Supabase
3. User enters new password (with confirmation)
4. Password updated
5. Redirect to login with success message

**Security:**
- Token expires after configured time (default: 1 hour)
- Invalid/expired tokens show error message
- Secure password update via Supabase Auth

### 5. Logout

**What happens:**
1. User clicks logout button
2. Supabase Auth sign out
3. Clear authentication state
4. Redirect to login page

**Available components:**
```tsx
import { LogoutButton } from '@/components/auth/LogoutButton'

<LogoutButton variant="ghost" />
```

## 🛡️ Route Protection

The middleware (`src/middleware.ts`) protects routes automatically:

### Protected Routes
All routes starting with `/dashboard` require authentication:
- `/dashboard`
- `/dashboard/leads`
- `/dashboard/conversas`
- `/dashboard/fluxos`
- `/dashboard/perfil`

**What happens when not authenticated:**
- Redirect to `/auth/login?redirect=/original-path`
- After login, user is redirected back to original destination

### Public Routes
- `/` (landing page)
- `/auth/*` (all auth pages)
- `/api/health` (health check)
- `/api/webhook/*` (webhooks must be public)

**What happens when already authenticated:**
- Accessing `/auth/login` → Redirect to `/dashboard`
- Accessing `/auth/register` → Redirect to `/dashboard`

## 🎣 useAuth Hook

Central hook for authentication state management.

### Usage

```tsx
'use client'

import { useAuth } from '@/hooks/useAuth'

export default function MyComponent() {
  const { user, consultant, isLoading, isAuthenticated, signOut, refreshConsultant } = useAuth()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return <div>Not logged in</div>
  }

  return (
    <div>
      <h1>Welcome, {consultant?.name}!</h1>
      <p>Email: {user?.email}</p>
      <p>Plan: {consultant?.subscription_tier}</p>
      <button onClick={signOut}>Logout</button>
    </div>
  )
}
```

### API

```typescript
interface UseAuthReturn {
  // Authentication state
  user: User | null                    // Supabase Auth user
  consultant: Consultant | null        // Consultant profile from database
  isLoading: boolean                   // Loading state
  isAuthenticated: boolean             // true if user is logged in

  // Methods
  signOut: () => Promise<void>         // Sign out and redirect to login
  refreshConsultant: () => Promise<void> // Refresh consultant data
}
```

### Features
- Automatic session initialization
- Real-time auth state updates (via `onAuthStateChange`)
- Automatic consultant profile fetching
- Token refresh handling

## 🎨 UI Components

### AuthLayout

Provides consistent layout for all auth pages:
- Centered content
- Logo header
- Clean background
- Footer

### UserMenu

Shows user profile in dashboard sidebar:
- Avatar with initials
- Name and email
- Subscription tier badge
- Logout button

```tsx
import { UserMenu } from '@/components/auth/UserMenu'

<UserMenu />
```

## 🔧 Configuration

### Environment Variables

Required in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000  # For password reset redirects
```

### Supabase Configuration

1. **Email Templates** (Supabase Dashboard → Authentication → Email Templates)
   - Confirm signup
   - Reset password
   - Magic link (optional)

2. **Site URL** (Supabase Dashboard → Settings → Authentication)
   - Development: `http://localhost:3000`
   - Production: Your production URL

3. **Redirect URLs** (allow list)
   - `http://localhost:3000/auth/reset-password`
   - `https://yourdomain.com/auth/reset-password`

## 📝 Database Schema

The authentication system integrates with the `consultants` table:

```sql
CREATE TABLE consultants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    whatsapp_number TEXT,
    vertical vertical_type DEFAULT 'saude',
    slug TEXT UNIQUE NOT NULL,
    subscription_tier TEXT DEFAULT 'freemium',
    monthly_lead_limit INTEGER DEFAULT 20,
    -- ... more fields
);
```

**Row Level Security (RLS):**
Consultants can only access their own data (see `supabase/migrations/20251217000002_rls_policies.sql`).

## 🧪 Testing

### Manual Testing Checklist

**Registration:**
- [ ] Register with valid data → Success
- [ ] Register with existing email → Error shown
- [ ] Register with invalid WhatsApp → Validation error
- [ ] Passwords don't match → Validation error
- [ ] Consultant profile created in database

**Login:**
- [ ] Login with valid credentials → Redirect to dashboard
- [ ] Login with invalid credentials → Error shown
- [ ] Login from protected route → Redirect back after login

**Password Recovery:**
- [ ] Request password reset → Email sent
- [ ] Check email and click link → Opens reset page
- [ ] Reset password with valid token → Success
- [ ] Try expired token → Error shown

**Route Protection:**
- [ ] Access `/dashboard` without auth → Redirect to login
- [ ] Access `/auth/login` while authenticated → Redirect to dashboard

**Logout:**
- [ ] Click logout → Signed out and redirected
- [ ] Try to access protected route → Redirect to login

### Automated Tests (TODO)

```bash
# Unit tests for useAuth hook
npm run test src/hooks/useAuth.test.ts

# E2E tests for auth flow
npm run test:e2e tests/auth.spec.ts
```

## 🚀 Next Steps

After implementing authentication, proceed with:

1. **Dashboard Implementation**
   - Basic dashboard layout (already created)
   - Stats and overview
   - Navigation
   - User profile settings

2. **Lead Management (CRUD)**
   - List leads
   - Create new lead
   - Edit lead
   - Delete lead
   - Lead filtering and search

3. **Additional Features**
   - Email verification (optional)
   - Social auth (Google, Facebook)
   - Two-factor authentication (2FA)
   - Session management (view active sessions)

## 📚 References

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Zod Validation](https://zod.dev/)
- [React Hooks Best Practices](https://react.dev/reference/react)

---

**Last Updated**: 2025-12-17
**Version**: 1.0.0
**Author**: Consultor.AI Team
