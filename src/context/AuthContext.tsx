import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
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
  showLogoutModal: boolean;
  setShowLogoutModal: (show: boolean) => void;
  confirmLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'skillnova_active_session_user';
const LOGOUT_FLAG_KEY = 'skillnova_explicit_logout';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Synchronous initial restore from localStorage to avoid flash of unauthenticated state
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return dataService.getCurrentUser() || null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  const isInitializedRef = useRef(false);

  // Sync state to localStorage & dataService
  const setPersistedUser = useCallback((user: User | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      localStorage.removeItem(LOGOUT_FLAG_KEY);
      dataService.setCurrentUser(user);
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      dataService.logout();
    }
  }, []);

  // Fetch full user profile & role from Supabase tables
  const fetchSupabaseUserProfile = async (authUserId: string, authEmail: string, metaRole?: string): Promise<User> => {
    try {
      // Query profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUserId)
        .maybeSingle();

      // Query user_roles table
      const { data: roleRow } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authUserId)
        .maybeSingle();

      const resolvedRole: UserRole = (roleRow?.role as UserRole) || (metaRole as UserRole) || 'student';
      const cleanEmail = authEmail || profile?.email || '';

      const user: User = {
        id: authUserId,
        email: cleanEmail,
        full_name: profile?.full_name || cleanEmail.split('@')[0],
        role: resolvedRole,
        status: 'active',
        theme_preference: (profile?.theme_preference as 'light' | 'dark') || 'light',
        created_at: profile?.created_at || new Date().toISOString(),
        assigned_courses: ['c0000000-0000-0000-0000-000000000101']
      };

      return user;
    } catch (e) {
      console.warn('[SkillNova Auth] Failed fetching profile from database, using auth metadata:', e);
      return {
        id: authUserId,
        email: authEmail,
        full_name: authEmail.split('@')[0],
        role: (metaRole as UserRole) || 'student',
        status: 'active',
        created_at: new Date().toISOString(),
        assigned_courses: ['c0000000-0000-0000-0000-000000000101']
      };
    }
  };

  // Initialize and listen to Supabase auth events
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    let isMounted = true;

    const initializeAuth = async () => {
      try {
        if (isLiveSupabaseConfigured) {
          // Check active remote Supabase session
          const { data, error } = await supabase.auth.getSession();
          if (error) {
            console.warn('[SkillNova Auth] Supabase getSession warning:', error.message);
          }

          const session = data?.session;
          if (session?.user && isMounted) {
            const user = await fetchSupabaseUserProfile(
              session.user.id,
              session.user.email || '',
              session.user.user_metadata?.role
            );
            if (isMounted) setPersistedUser(user);
          } else {
            // Restore cached session if user did not explicitly log out
            const explicitLogout = localStorage.getItem(LOGOUT_FLAG_KEY);
            if (explicitLogout !== 'true') {
              const stored = localStorage.getItem(AUTH_STORAGE_KEY);
              if (stored && isMounted) {
                try {
                  const parsed: User = JSON.parse(stored);
                  setPersistedUser(parsed);
                } catch {
                  // Ignore parse error
                }
              }
            }
          }

          // Single persistent onAuthStateChange listener
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, newSession) => {
              if (!isMounted) return;

              if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
                if (newSession?.user) {
                  const user = await fetchSupabaseUserProfile(
                    newSession.user.id,
                    newSession.user.email || '',
                    newSession.user.user_metadata?.role
                  );
                  if (isMounted) setPersistedUser(user);
                }
              } else if (event === 'SIGNED_OUT') {
                const explicit = localStorage.getItem(LOGOUT_FLAG_KEY);
                if (explicit === 'true' && isMounted) {
                  setPersistedUser(null);
                }
              }
            }
          );

          return () => {
            subscription.unsubscribe();
          };
        } else {
          // Local fallback mode
          const stored = localStorage.getItem(AUTH_STORAGE_KEY);
          if (stored && isMounted) {
            try {
              const parsed: User = JSON.parse(stored);
              setPersistedUser(parsed);
            } catch {
              // Ignore
            }
          }
        }
      } catch (err) {
        console.warn('[SkillNova Auth] Auth initialization encountered warning:', err);
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
  }, [setPersistedUser]);

  const login = async (email: string, password = '', expectedRole?: UserRole): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();

      // Check deactivation in dataService
      const existingUser = dataService.getUserByEmail(cleanEmail);
      if (existingUser && existingUser.status === 'inactive') {
        return { success: false, error: 'Your account has been deactivated by an Administrator.' };
      }

      if (isLiveSupabaseConfigured) {
        try {
          // 1. Attempt standard Supabase Auth Sign In
          const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: password || 'SkillNova@2026',
          });

          if (!signInErr && signInData?.user) {
            const user = await fetchSupabaseUserProfile(
              signInData.user.id,
              signInData.user.email || cleanEmail,
              signInData.user.user_metadata?.role || expectedRole
            );

            // Role guard
            if (expectedRole) {
              if (expectedRole === 'admin' && user.role === 'student') {
                return { success: false, error: 'Unauthorized: Student credentials cannot access the Administrative Portal.' };
              }
              if (expectedRole === 'sub_admin' && user.role === 'student') {
                return { success: false, error: 'Unauthorized: Student credentials cannot access the Sub-Admin Portal.' };
              }
            }

            setPersistedUser(user);
            return { success: true };
          }

          // 2. If user not found or invalid credentials, attempt registration / auto-provisioning
          if (signInErr && (signInErr.message.toLowerCase().includes('invalid login credentials') || signInErr.message.toLowerCase().includes('user not found'))) {
            const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
              email: cleanEmail,
              password: password || 'SkillNova@2026',
              options: {
                data: {
                  full_name: cleanEmail.split('@')[0],
                  role: expectedRole || 'student'
                }
              }
            });

            if (!signUpErr && signUpData?.user) {
              // If user was created and session established
              if (signUpData.session) {
                const user = await fetchSupabaseUserProfile(
                  signUpData.user.id,
                  signUpData.user.email || cleanEmail,
                  expectedRole || 'student'
                );
                setPersistedUser(user);
                return { success: true };
              }
            }
          }
        } catch (supabaseErr: any) {
          console.warn('[SkillNova Auth] Supabase direct auth attempt note:', supabaseErr?.message || supabaseErr);
        }
      }

      // Local authentication fallback for mock/demo preview
      const localRes = dataService.login(cleanEmail, expectedRole);
      if (localRes.success && localRes.user) {
        setPersistedUser(localRes.user);
        return { success: true };
      }

      return {
        success: false,
        error: localRes.error || 'Authentication failed. Please verify your student email or contact administrator.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    localStorage.setItem(LOGOUT_FLAG_KEY, 'true');
    try {
      if (isLiveSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn('Sign out warning:', e);
    }
    setPersistedUser(null);
    sessionStorage.setItem('skillnova_logout_toast', 'You have been successfully logged out.');
  };

  const logout = async () => {
    setShowLogoutModal(true);
  };

  const switchRole = (newRole: UserRole) => {
    dataService.switchRole(newRole);
    const updated = dataService.getCurrentUser();
    if (updated) {
      setPersistedUser(updated);
    }
  };

  const refreshUser = () => {
    if (currentUser) {
      const updated = dataService.getUserById(currentUser.id);
      if (updated) {
        setPersistedUser(updated);
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
        refreshUser,
        showLogoutModal,
        setShowLogoutModal,
        confirmLogout,
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

export default AuthContext;
