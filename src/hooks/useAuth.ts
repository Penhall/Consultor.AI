'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

type Consultant = Database['public']['Tables']['consultants']['Row'];

// Safety timeout: if Supabase is unreachable, don't hang forever.
// 20000 was too aggressive for Docker on Windows (WSL2 networking adds ~20s latency
// for browser-to-PostgREST calls via localhost:54321). 45s gives fetchConsultant
// time to complete in Docker while still protecting against truly unreachable Supabase.
const AUTH_INIT_TIMEOUT_MS = 45000;
interface AuthState {
  user: User | null;
  consultant: Consultant | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface UseAuthReturn extends AuthState {
  signOut: () => void;
  refreshConsultant: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    consultant: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Fetch consultant profile
  const fetchConsultant = async (
    userId: string,
    userEmail?: string
  ): Promise<Consultant | null> => {
    try {
      const supabase = createClient();

      // Try to find by user_id first
      let { data, error } = await supabase
        .from('consultants')
        .select('*')
        .eq('user_id', userId)
        .single();

      // If not found by user_id, try by email (for demo accounts)
      if (error && userEmail) {
        const result = await supabase
          .from('consultants')
          .select('*')
          .eq('email', userEmail)
          .single();

        data = result.data;
        error = result.error;

        // If found by email, update user_id to link them
        if (data && !error) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const consultantData = data as any;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any)
            .from('consultants')
            .update({ user_id: userId })
            .eq('id', consultantData.id);
        }
      }

      if (error) {
        console.error('Error fetching consultant:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching consultant:', error);
      return null;
    }
  };

  // Refresh consultant data
  const refreshConsultant = async () => {
    if (!state.user) {
      return;
    }

    const consultant = await fetchConsultant(state.user.id, state.user.email);
    setState(prev => ({ ...prev, consultant }));
  };

  // Sign out â€” clear local React state instantly, then do a full-page navigation to the
  // server-side signout route which clears the auth cookie via Set-Cookie headers.
  // Must use window.location (not router.push) so the browser applies the cookie headers.
  const signOut = () => {
    setState({ user: null, consultant: null, isLoading: false, isAuthenticated: false });
    window.location.href = '/api/auth/signout';
  };

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    const initializeAuth = async () => {
      // Safety timeout: if Supabase is unreachable, don't hang forever.
      // 7s was too aggressive for Docker cold starts and could trigger false redirects.
      const timeout = setTimeout(() => {
        console.warn('Auth initialization timed out - Supabase may be unreachable');
        setState({
          user: null,
          consultant: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }, AUTH_INIT_TIMEOUT_MS);

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          const consultant = await fetchConsultant(session.user.id, session.user.email);
          clearTimeout(timeout);
          setState({
            user: session.user,
            consultant,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          clearTimeout(timeout);
          setState({
            user: null,
            consultant: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      } catch (error) {
        clearTimeout(timeout);
        console.error('Error initializing auth:', error);
        setState({
          user: null,
          consultant: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const consultant = await fetchConsultant(session.user.id, session.user.email);
        setState({
          user: session.user,
          consultant,
          isLoading: false,
          isAuthenticated: true,
        });
      } else if (event === 'SIGNED_OUT') {
        setState({
          user: null,
          consultant: null,
          isLoading: false,
          isAuthenticated: false,
        });
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Optionally refresh consultant data on token refresh
        const consultant = await fetchConsultant(session.user.id, session.user.email);
        setState({
          user: session.user,
          consultant,
          isLoading: false,
          isAuthenticated: true,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    ...state,
    signOut,
    refreshConsultant,
  };
}
