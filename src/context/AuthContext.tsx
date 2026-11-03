
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';

import type { User, UserRole } from '../types';
import { dataService } from '../services/dataService';
import {
  supabase,
  isLiveSupabaseConfigured,
} from '../services/supabaseClient';

interface AuthContextType {
  currentUser: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password?: string,
    expectedRole?: UserRole
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  refreshUser: () => void;
  showLogoutModal: boolean;
  setShowLogoutModal: (show: boolean) => void;
  confirmLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

const AUTH_STORAGE_KEY = 'skillnova_active_session_user';
const LOGOUT_FLAG_KEY = 'skillnova_explicit_logout';

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {

  // In live Supabase mode, never restore identity from localStorage.
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    if (isLiveSupabaseConfigured) {
      return null;
    }

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

  const [isLoading, setIsLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const isInitializedRef = useRef(false);

  // --------------------------------------------------
  // Persist user state
  // --------------------------------------------------

  const setPersistedUser = useCallback(
    (user: User | null) => {
      setCurrentUser(user);

      if (user) {
        localStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify(user)
        );

        localStorage.removeItem(LOGOUT_FLAG_KEY);

        dataService.setCurrentUser(user);
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        dataService.logout();
      }
    },
    []
  );

  // --------------------------------------------------
  // Fetch profile and role from Supabase
  // --------------------------------------------------

  const fetchSupabaseUserProfile = async (
    authUserId: string,
    authEmail: string
  ): Promise<User> => {

    // Fetch profile.
    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUserId)
      .maybeSingle();

    if (profileError) {
      console.error(
        '[SkillNova Auth] Profile fetch error:',
        profileError
      );

      throw profileError;
    }

    // Fetch actual role from user_roles.
    const {
      data: roleRow,
      error: roleError,
    } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', authUserId)
      .maybeSingle();

    if (roleError) {
      console.error(
        '[SkillNova Auth] Role fetch error:',
        roleError
      );

      throw roleError;
    }

    // Never grant admin privileges using frontend metadata.
    const resolvedRole: UserRole =
      (roleRow?.role as UserRole) || 'student';

    const cleanEmail =
      authEmail || profile?.email || '';

    let assignedCourses: string[] = [];

    if (resolvedRole === 'student') {
      const {
        data: enrollments,
        error: enrollmentError,
      } = await supabase
        .from('course_enrollments')
        .select('course_id')
        .eq('student_id', authUserId);

      if (enrollmentError) {
        console.warn(
          '[SkillNova Auth] Enrollment fetch warning:',
          enrollmentError.message
        );
      }

      if (enrollments?.length) {
        assignedCourses = enrollments.map(
          (enrollment: any) => enrollment.course_id
        );
      }

    } else if (resolvedRole === 'sub_admin') {
      const {
        data: subAdmin,
        error: subAdminError,
      } = await supabase
        .from('sub_admins')
        .select('assigned_courses')
        .eq('user_id', authUserId)
        .maybeSingle();

      if (subAdminError) {
        console.warn(
          '[SkillNova Auth] Sub-admin fetch warning:',
          subAdminError.message
        );
      }

      if (
        Array.isArray(subAdmin?.assigned_courses)
      ) {
        assignedCourses = subAdmin.assigned_courses;
      }
    }

    const user: User = {
      id: authUserId,
      email: cleanEmail,
      username: profile?.username || cleanEmail.split('@')[0],
      full_name:
        profile?.full_name ||
        cleanEmail.split('@')[0],
      role: resolvedRole,
      status: 'active',
      theme_preference:
        (profile?.theme_preference as 'light' | 'dark') ||
        'light',
      created_at:
        profile?.created_at ||
        new Date().toISOString(),
      assigned_courses: assignedCourses,
    };

    return user;
  };

  // --------------------------------------------------
  // Initialize Supabase authentication
  // --------------------------------------------------

  useEffect(() => {
    if (isInitializedRef.current) return;

    isInitializedRef.current = true;

    let isMounted = true;

    if (!isLiveSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    const loadUser = async (session: any) => {
      if (!isMounted) return;

      if (!session?.user) {
        setPersistedUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const user = await fetchSupabaseUserProfile(
          session.user.id,
          session.user.email || ''
        );

        if (isMounted) {
          setPersistedUser(user);
          void dataService.syncAllFromSupabase();
        }

      } catch (error) {
        console.error(
          '[SkillNova Auth] User initialization failed:',
          error
        );

        if (isMounted) {
          setPersistedUser(null);
        }

      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Subscribe to authentication changes.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;

        if (event === 'SIGNED_OUT') {
          setPersistedUser(null);
          setIsLoading(false);
          return;
        }

        if (
          event === 'SIGNED_IN' ||
          event === 'TOKEN_REFRESHED' ||
          event === 'USER_UPDATED' ||
          event === 'INITIAL_SESSION'
        ) {
          // Run database queries outside the auth callback.
          setTimeout(() => {
            if (isMounted) {
              void loadUser(session);
              void dataService.syncAllFromSupabase();
            }
          }, 0);
        }
      }
    );

    // Verify the actual Supabase session.
    const initialize = async () => {
      try {
        const {
          data,
          error,
        } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (!isMounted) return;

        if (data.session?.user) {
          await loadUser(data.session);
        } else {
          // No Supabase session means no authenticated user.
          setPersistedUser(null);
          setIsLoading(false);
        }

      } catch (error) {
        console.error(
          '[SkillNova Auth] Initialization error:',
          error
        );

        if (isMounted) {
          setPersistedUser(null);
          setIsLoading(false);
        }
      }
    };

    void initialize();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [setPersistedUser]);

  // --------------------------------------------------
  // Login
  // --------------------------------------------------

  const login = async (
    identifier: string,
    password = '',
    expectedRole?: UserRole
  ): Promise<{ success: boolean; error?: string }> => {

    setIsLoading(true);

    try {
      const cleanInput = identifier.trim().toLowerCase();

      if (!cleanInput || !password) {
        return {
          success: false,
          error: 'Please enter your username or email and password.',
        };
      }

      // Build candidate emails to resolve username to Supabase Auth email
      let candidateEmails: string[] = [];

      if (cleanInput.includes('@')) {
        // User entered a full email address (e.g. admin@skillnova.edu, student@skillnova.edu)
        candidateEmails = [cleanInput];
      } else {
        // User entered a username (e.g. mohan, mentor, student)
        // 1. Check existing local registry
        const localMatch = dataService.getUserByEmail(cleanInput);
        if (localMatch?.email) {
          candidateEmails.push(localMatch.email.toLowerCase());
        }

        // 2. Synthesize standard platform domains
        if (expectedRole === 'student') {
          candidateEmails.push(`${cleanInput}@student.skillnova.edu`);
          candidateEmails.push(`${cleanInput}@skillnova.edu`);
        } else {
          // Admin or sub-admin portal
          candidateEmails.push(`${cleanInput}@skillnova.edu`);
          candidateEmails.push(`${cleanInput}@student.skillnova.edu`);
        }

        // Deduplicate while preserving priority
        candidateEmails = Array.from(new Set(candidateEmails));
      }

      let lastAuthError: any = null;

      // REAL SUPABASE AUTHENTICATION
      if (isLiveSupabaseConfigured) {
        let authSuccessData: any = null;
        let authenticatedEmail = '';

        for (const candidate of candidateEmails) {
          const {
            data,
            error,
          } = await supabase.auth.signInWithPassword({
            email: candidate,
            password,
          });

          if (!error && data?.user && data?.session) {
            authSuccessData = data;
            authenticatedEmail = candidate;
            break;
          }

          lastAuthError = error;
          const msg = (error?.message || '').toLowerCase();
          // Stop trying candidate domains if the error is not a bad credential
          if (
            !msg.includes('invalid login credentials') &&
            !msg.includes('invalid credentials') &&
            !msg.includes('user not found') &&
            !msg.includes('email not confirmed')
          ) {
            break;
          }
        }

        if (authSuccessData?.user && authSuccessData?.session) {
          // Fetch role from the database.
          const user = await fetchSupabaseUserProfile(
            authSuccessData.user.id,
            authSuccessData.user.email || authenticatedEmail
          );

          // Verify admin portal permissions (both Super Admin and Sub-Admin are authorized).
          if (
            expectedRole === 'admin' &&
            user.role !== 'admin' &&
            user.role !== 'sub_admin'
          ) {
            await supabase.auth.signOut();

            return {
              success: false,
              error:
                'Unauthorized: Administrative privileges required.',
            };
          }

          if (
            expectedRole === 'sub_admin' &&
            user.role !== 'sub_admin' &&
            user.role !== 'admin'
          ) {
            await supabase.auth.signOut();

            return {
              success: false,
              error:
                'Unauthorized: Sub-admin privileges required.',
            };
          }

          setPersistedUser(user);
          void dataService.syncAllFromSupabase();

          console.log(
            '[SkillNova Auth] Login successful:',
            {
              id: authSuccessData.user.id,
              email: authSuccessData.user.email,
              role: user.role,
            }
          );

          return { success: true };
        }

        if (lastAuthError) {
          console.warn(
            '[SkillNova Auth] Supabase direct auth attempt note:',
            lastAuthError.message
          );
        }
      }

      // LOCAL FALLBACK FOR DEMO / EVALUATOR ACCOUNTS
      const resolvedIdentifier = candidateEmails[0] || cleanInput;
      const existingUser =
        dataService.getUserByEmail(cleanInput) ||
        dataService.getUserByEmail(resolvedIdentifier);

      if (
        existingUser &&
        existingUser.status === 'inactive'
      ) {
        return {
          success: false,
          error:
            'Your account has been deactivated by an Administrator.',
        };
      }

      const localRes = dataService.login(
        cleanInput,
        expectedRole
      );

      if (localRes.success && localRes.user) {
        setPersistedUser(localRes.user);

        return { success: true };
      }

      return {
        success: false,
        error:
          lastAuthError?.message ||
          localRes.error ||
          'Authentication failed. Please verify your credentials.',
      };

    } catch (error: any) {
      console.error(
        '[SkillNova Auth] Login exception:',
        error
      );

      return {
        success: false,
        error:
          error?.message ||
          'Unexpected authentication error.',
      };

    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------------------
  // Logout
  // --------------------------------------------------

  const confirmLogout = async () => {
    setShowLogoutModal(false);

    localStorage.setItem(LOGOUT_FLAG_KEY, 'true');

    try {
      if (isLiveSupabaseConfigured) {
        const { error } = await supabase.auth.signOut();

        if (error) {
          console.error(
            '[SkillNova Auth] Sign out error:',
            error
          );
        }
      }
    } catch (error) {
      console.error(
        '[SkillNova Auth] Logout exception:',
        error
      );
    }

    setPersistedUser(null);

    sessionStorage.setItem(
      'skillnova_logout_toast',
      'You have been successfully logged out.'
    );
  };

  const logout = async () => {
    setShowLogoutModal(true);
  };

  // --------------------------------------------------
  // Role switching
  // --------------------------------------------------

  const switchRole = (newRole: UserRole) => {
    if (isLiveSupabaseConfigured) {
      console.warn(
        '[SkillNova Auth] Role switching is disabled in live mode. Roles must be assigned through the database.'
      );

      return;
    }

    // Allowed only in local demo mode.
    dataService.switchRole(newRole);

    const updated = dataService.getCurrentUser();

    if (updated) {
      setPersistedUser(updated);
      void dataService.syncAllFromSupabase();
    }
  };

  // --------------------------------------------------
  // Refresh current user
  // --------------------------------------------------

  const refreshUser = () => {
    if (!isLiveSupabaseConfigured) {
      if (currentUser) {
        const updated = dataService.getUserById(
          currentUser.id
        );

        if (updated) {
          setPersistedUser(updated);
        }
      }

      return;
    }

    // In live mode, refresh from the real session.
    void (async () => {
      try {
        const {
          data,
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        if (!data.session?.user) {
          setPersistedUser(null);
          return;
        }

        const user = await fetchSupabaseUserProfile(
          data.session.user.id,
          data.session.user.email || ''
        );

        setPersistedUser(user);

      } catch (error) {
        console.error(
          '[SkillNova Auth] Refresh failed:',
          error
        );

        setPersistedUser(null);
      }
    })();
  };

  // --------------------------------------------------
  // Context provider
  // --------------------------------------------------

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

// --------------------------------------------------
// Custom authentication hook
// --------------------------------------------------

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return context;
};

export default AuthContext;
