
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

    if (!profile) {
      const err = new Error('ACCOUNT_DELETED');
      (err as any).code = 'ACCOUNT_DELETED';
      throw err;
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
    let studentStatus: 'active' | 'inactive' | 'suspended' = 'active';
    let studentPhone = (profile as any)?.phone_number || (profile as any)?.phone || '';
    let studentCollege = '';
    let studentBranch = '';
    let studentYear = '';

    if (resolvedRole === 'student') {
      const { data: studentRow, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', authUserId)
        .maybeSingle();

      if (studentError) {
        console.warn(
          '[SkillNova Auth] Student table check warning:',
          studentError.message
        );
      }

      // If student account record does not exist or has been deleted
      if (!studentRow) {
        const err = new Error('ACCOUNT_DELETED');
        (err as any).code = 'ACCOUNT_DELETED';
        throw err;
      }

      studentStatus = (studentRow.status as 'active' | 'inactive' | 'suspended') || 'active';
      studentPhone = studentRow.phone || studentPhone;
      studentCollege = studentRow.college || '';
      studentBranch = studentRow.branch || '';
      studentYear = studentRow.year_of_study || '';

      if (studentStatus !== 'active') {
        const err = new Error('ACCOUNT_DEACTIVATED');
        (err as any).code = 'ACCOUNT_DEACTIVATED';
        throw err;
      }

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
      status: studentStatus,
      phone_number: studentPhone,
      phone: studentPhone,
      college: studentCollege,
      branch: studentBranch,
      year_of_study: studentYear,
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

      } catch (error: any) {
        console.error(
          '[SkillNova Auth] User initialization failed:',
          error
        );

        if (error?.message === 'ACCOUNT_DEACTIVATED' || error?.message === 'ACCOUNT_DELETED') {
          await supabase.auth.signOut().catch(() => { });
        }

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
      // Exact matching without auto-trimming, lowercasing, or altering credentials
      if (!identifier || !password) {
        return {
          success: false,
          error: 'Please enter your exact username or email and password.',
        };
      }

      // Build candidate emails to resolve username to Supabase Auth email.
      // Preserve exact case of identifier.
      let candidateEmails: string[] = [];

      if (identifier.includes('@')) {
        candidateEmails = [identifier];
      } else {
        // Try exact casing domain synthesis first
        if (expectedRole === 'student') {
          candidateEmails.push(`${identifier}@student.skillnova.edu`);
          candidateEmails.push(`${identifier}@skillnova.edu`);
          // Also try lowercase email for auth lookup if Supabase lowercased the auth email,
          // but we will verify the exact case-sensitive username against the profile record below!
          if (identifier.toLowerCase() !== identifier) {
            candidateEmails.push(`${identifier.toLowerCase()}@student.skillnova.edu`);
          }
        } else {
          candidateEmails.push(`${identifier}@skillnova.edu`);
          candidateEmails.push(`${identifier}@student.skillnova.edu`);
          if (identifier.toLowerCase() !== identifier) {
            candidateEmails.push(`${identifier.toLowerCase()}@skillnova.edu`);
          }
        }

        const localMatch = dataService.getUserByEmail(identifier);
        if (localMatch?.email) {
          candidateEmails.unshift(localMatch.email);
        }

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
          let user: User;
          try {
            user = await fetchSupabaseUserProfile(
              authSuccessData.user.id,
              authSuccessData.user.email || authenticatedEmail
            );
          } catch (profileErr: any) {
            await supabase.auth.signOut().catch(() => { });
            if (profileErr?.message === 'ACCOUNT_DEACTIVATED') {
              void dataService.recordAuditEvent({
                action: 'LOGIN_FAILED',
                entity_type: 'auth',
                details: `Deactivated student account attempted login: "${identifier}"`,
                actor_email: authenticatedEmail || candidateEmails[0],
                user_role: 'student',
                status: 'failed'
              });
              return {
                success: false,
                error: 'Your account has been deactivated. Please contact the administrator.'
              };
            }
            // For deleted or missing profile rows, return standard Invalid credentials
            void dataService.recordAuditEvent({
              action: 'LOGIN_FAILED',
              entity_type: 'auth',
              details: `Non-existent or deleted student account attempted login: "${identifier}"`,
              actor_email: authenticatedEmail || candidateEmails[0],
              user_role: 'student',
              status: 'failed'
            });
            return {
              success: false,
              error: 'Invalid username or password.'
            };
          }

          // EXACT case-sensitive username check for students
          if (expectedRole === 'student' && !identifier.includes('@')) {
            const registeredUser = user.username || '';
            if (registeredUser !== identifier) {
              await supabase.auth.signOut();
              void dataService.recordAuditEvent({
                action: 'LOGIN_FAILED',
                entity_type: 'auth',
                details: `Case sensitivity mismatch: Entered "${identifier}" vs Registered "${registeredUser}"`,
                actor_email: user.email,
                username: identifier,
                user_role: 'student',
                status: 'failed'
              });
              return {
                success: false,
                error: 'Invalid username or password.'
              };
            }
          }

          // Check if student is deactivated
          if (user.status && user.status !== 'active') {
            await supabase.auth.signOut();
            void dataService.recordAuditEvent({
              action: 'LOGIN_FAILED',
              entity_type: 'auth',
              details: `Deactivated account attempted login: @${user.username || user.email}`,
              actor_email: user.email,
              username: user.username,
              user_role: user.role,
              status: 'failed'
            });
            return {
              success: false,
              error: 'Your account has been deactivated. Please contact the administrator.'
            };
          }

          // Role enforcement: Admin credentials CANNOT access student portal
          if (
            expectedRole === 'student' &&
            (user.role === 'admin' || user.role === 'sub_admin')
          ) {
            await supabase.auth.signOut();
            void dataService.recordAuditEvent({
              action: 'LOGIN_FAILED',
              entity_type: 'auth',
              details: `Admin ${user.email} attempted to log into Student Portal`,
              actor_email: user.email,
              user_role: user.role,
              status: 'failed'
            });
            return {
              success: false,
              error: 'Unauthorized: Admin accounts cannot access the student portal. Please sign in via the Admin Portal.',
            };
          }

          // Student credentials CANNOT access admin portal
          if (
            expectedRole === 'admin' &&
            user.role !== 'admin' &&
            user.role !== 'sub_admin'
          ) {
            await supabase.auth.signOut();
            void dataService.recordAuditEvent({
              action: 'LOGIN_FAILED',
              entity_type: 'auth',
              details: `Student @${user.username || user.email} attempted to log into Admin Portal`,
              actor_email: user.email,
              user_role: user.role,
              status: 'failed'
            });
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
            void dataService.recordAuditEvent({
              action: 'LOGIN_FAILED',
              entity_type: 'auth',
              details: `Unauthorized sub-admin access attempt: ${user.email}`,
              actor_email: user.email,
              user_role: user.role,
              status: 'failed'
            });
            return {
              success: false,
              error:
                'Unauthorized: Sub-admin privileges required.',
            };
          }

          setPersistedUser(user);
          void dataService.syncAllFromSupabase();

          // Record successful login in audit logs
          void dataService.recordAuditEvent({
            action: 'LOGIN_SUCCESS',
            entity_type: 'auth',
            entity_id: user.id,
            details: `User @${user.username || user.email.split('@')[0]} logged in successfully as ${user.role}`,
            actor_email: user.email,
            username: user.username || user.email.split('@')[0],
            user_role: user.role,
            status: 'active',
            login_time: new Date().toISOString(),
            metadata: {
              role: user.role,
              username: user.username,
              session_id: authSuccessData.session?.access_token?.slice(-16)
            }
          });

          return { success: true };
        }

        // Supabase Auth failed (invalid username or password)
        void dataService.recordAuditEvent({
          action: 'LOGIN_FAILED',
          entity_type: 'auth',
          details: `Failed login attempt for identifier "${identifier}"`,
          actor_email: candidateEmails[0] || identifier,
          username: identifier,
          user_role: expectedRole || 'student',
          status: 'failed'
        });

        return {
          success: false,
          error: 'Invalid username or password.'
        };
      }

      // If Supabase is not configured at all (fallback only for empty env configs)
      return {
        success: false,
        error: 'Authentication service unavailable. Please check your Supabase connection.',
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

    if (currentUser) {
      void dataService.recordAuditEvent({
        action: 'LOGOUT',
        entity_type: 'auth',
        entity_id: currentUser.id,
        details: `User @${currentUser.username || currentUser.email} signed out`,
        actor_email: currentUser.email,
        username: currentUser.username || currentUser.email.split('@')[0],
        user_role: currentUser.role,
        status: 'logged_out',
        logout_time: new Date().toISOString()
      });
    }

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
