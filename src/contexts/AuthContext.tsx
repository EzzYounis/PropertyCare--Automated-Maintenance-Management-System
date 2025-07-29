import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'tenant' | 'agent' | 'landlord';

export interface UserProfile {
  id: string;
  username: string;
  role: UserRole;
  name: string;
  phone?: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (username: string, password: string, role: UserRole, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  clearAuth: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session);
        
        // Handle token refresh errors
        if (event === 'TOKEN_REFRESHED' && !session) {
          console.log('Token refresh failed, clearing auth state');
          await clearAuthState();
          return;
        }

        // Handle sign out events
        if (event === 'SIGNED_OUT') {
          await clearAuthState();
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    // THEN check for existing session with error handling
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        await clearAuthState();
        return;
      }

      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    }).catch(async (error) => {
      console.error('Failed to get session:', error);
      await clearAuthState();
    });

    return () => subscription.unsubscribe();
  }, []);

  const clearAuthState = async () => {
    try {
      // Clear localStorage tokens
      localStorage.removeItem('sb-cdbztlkapkmkmlhlcmal-auth-token');
      localStorage.removeItem('supabase.auth.token');
      
      // Reset state
      setSession(null);
      setUser(null);
      setProfile(null);
      setLoading(false);
    } catch (error) {
      console.error('Error clearing auth state:', error);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: `${username}@propertycare.app`,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const signup = async (username: string, password: string, role: UserRole, name: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: `${username}@propertycare.app`,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            username,
            role,
            name
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      await clearAuthState();
    } catch (error) {
      console.error('Error during logout:', error);
      // Still clear local state even if signOut fails
      await clearAuthState();
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      login,
      signup,
      logout,
      clearAuth: clearAuthState,
      isAuthenticated: !!user,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};