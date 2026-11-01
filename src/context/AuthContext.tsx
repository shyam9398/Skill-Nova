import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types';
import { dataService } from '../services/dataService';
import { supabase, isLiveSupabaseConfigured } from '../services/supabaseClient';

interface AuthContextType {
  currentUser: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string, expectedRole?: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'skillnova_active_session_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session on mount
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        if (isLiveSupabaseConfigured) {
          // Live Supabase Auth
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) {
            console.warn('Supabase getSession error:', error.message);
          }

          if (session?.user && isMounted) {
            // Find or map user profile
            const user = dataService.getUserByEmail(session.user.email || '');
            if (user) {
              setCurrentUser(user);
              dataService.setCurrentUser(user);
              localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
            }
          } else {
            // Check fallback stored session
            restoreStoredSession();
          }

          // Subscribe to auth state changes
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, newSession) => {
              if (!isMounted) return;
              if (newSession?.user) {
                const user = dataService.getUserByEmail(newSession.user.email || '');
                if (user) {
                  setCurrentUser(user);
                  dataService.setCurrentUser(user);
                  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
                }
              } else if (_event === 'SIGNED_OUT') {
                setCurrentUser(null);
                localStorage.removeItem(AUTH_STORAGE_KEY);
              }
            }
          );

          return () => {
            subscription.unsubscribe();
          };
        } else {
          // Local persistent session mode
          restoreStoredSession();
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        restoreStoredSession();
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const restoreStoredSession = () => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed: User = JSON.parse(stored);
        // Verify user still exists in database
        const fresh = dataService.getUserById(parsed.id);
        if (fresh) {
          setCurrentUser(fresh);
          dataService.setCurrentUser(fresh);
          return;
        }
      }

      // If no stored session, fallback to current user from dataService
      const current = dataService.getCurrentUser();
      if (current) {
        setCurrentUser(current);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(current));
      }
    } catch (e) {
      console.warn('Session restore error:', e);
    }
  };

  const login = async (email: string, password = '', expectedRole?: UserRole): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      if (isLiveSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password || 'SkillNova@2026'
        });

        if (error) {
          // If login fails in Supabase, also attempt dataService lookup
          const localRes = dataService.login(email, expectedRole);
          if (localRes.success && localRes.user) {
            setCurrentUser(localRes.user);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(localRes.user));
            return { success: true };
          }
          return { success: false, error: error.message };
        }

        if (data.user) {
          const matched = dataService.getUserByEmail(data.user.email || email);
          if (matched) {
            if (expectedRole && expectedRole !== matched.role) {
              if (expectedRole === 'admin' && matched.role !== 'sub_admin') {
                return { success: false, error: `Unauthorized. ${email} is not registered with administrative privileges.` };
              }
              if (expectedRole === 'student' && matched.role !== 'student') {
                return { success: false, error: `Account ${email} is an administrative account. Please use Admin Portal.` };
              }
            }
            setCurrentUser(matched);
            dataService.setCurrentUser(matched);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(matched));
            return { success: true };
          }
        }
      }

      // Fast local verification (with zero plaintext exposure)
      const res = dataService.login(email, expectedRole);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(res.user));
        return { success: true };
      }
      return { success: false, error: res.error || 'Invalid credentials or user deactivated by Administrator' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (isLiveSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn('Sign out error:', e);
    }
    dataService.logout();
    setCurrentUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const switchRole = (newRole: UserRole) => {
    dataService.switchRole(newRole);
    const updated = dataService.getCurrentUser();
    if (updated) {
      setCurrentUser(updated);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
    }
  };

  const refreshUser = () => {
    if (currentUser) {
      const updated = dataService.getUserById(currentUser.id);
      if (updated) {
        setCurrentUser(updated);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser?.role || null,
        isAuthenticated: Boolean(currentUser),
        isLoading,
        login,
        logout,
        switchRole,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
