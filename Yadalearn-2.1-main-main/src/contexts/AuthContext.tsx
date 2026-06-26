import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface User {
  id: string; // Supabase auth.users(id)
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  bio?: string;
  country?: string;
}

interface AuthContextType {
  user: User | null;
  isLoaded: boolean;
  userRole: 'teacher' | 'student' | null;
  onboardingCompleted: boolean;
  subjects: string[];
  setUserRole: (role: 'teacher' | 'student' | null) => void;
  setOnboardingCompleted: (completed: boolean, subjects?: string[], onboardingAnswers?: any, role?: 'teacher' | 'student' | null) => Promise<void>;
  clearUserRole: () => void;
  login: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<any>;
  signInWithGoogle: () => Promise<void>;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('yadalearn-user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.id) {
          return {
            id: parsed.id,
            email: parsed.email || '',
            name: parsed.name || '',
            imageUrl: parsed.imageUrl || parsed.avatar_url,
            bio: parsed.bio || '',
            country: parsed.country || ''
          };
        }
      } catch (e) {
        console.error('Error parsing cached user:', e);
      }
    }
    return null;
  });
  const [userRole, setUserRoleState] = useState<'teacher' | 'student' | null>(() => {
    const savedRole = localStorage.getItem('yadalearn-user-role');
    return (savedRole === 'teacher' || savedRole === 'student') ? savedRole : null;
  });
  const [onboardingCompleted, setOnboardingCompletedState] = useState<boolean>(() => {
    return localStorage.getItem('yadalearn-onboarding-completed') === 'true';
  });
  const [subjects, setSubjectsState] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(() => {
    const hasRole = localStorage.getItem('yadalearn-user-role');
    const hasUser = localStorage.getItem('yadalearn-user');
    return !!(hasRole && hasUser);
  });
  const fetchingUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Check for OAuth redirect errors in hash or query parameters
    const hash = window.location.hash;
    const search = window.location.search;
    
    if (hash && (hash.includes('error=') || hash.includes('error_description='))) {
      const hashStr = hash.startsWith('#') ? hash.substring(1) : hash;
      const params = new URLSearchParams(hashStr);
      const errorMsg = params.get('error_description') || params.get('error') || 'OAuth authentication failed';
      
      console.error('Supabase OAuth Error:', errorMsg);
      sessionStorage.setItem('oauth_error', decodeURIComponent(errorMsg).replace(/\+/g, ' '));
      
      window.location.hash = '';
      setIsLoaded(true);
      return;
    } else if (search && (search.includes('error=') || search.includes('error_description='))) {
      const params = new URLSearchParams(search);
      const errorMsg = params.get('error_description') || params.get('error') || 'OAuth authentication failed';
      
      console.error('Supabase OAuth Error:', errorMsg);
      sessionStorage.setItem('oauth_error', decodeURIComponent(errorMsg).replace(/\+/g, ' '));
      
      setIsLoaded(true);
      return;
    }

    const hasHashToken = window.location.hash.includes('access_token=') || window.location.href.includes('access_token=');
    let isProcessingOAuth = hasHashToken;

    console.log('AuthContext: Triggering direct diagnostic fetch test...');
    fetch('https://yxqezrvgvfwdgrlwczea.supabase.co/rest/v1/', {
      headers: { 
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      }
    })
      .then(res => console.log('AuthContext: Direct diagnostic fetch test succeeded with status:', res.status))
      .catch(err => console.error('AuthContext: Direct diagnostic fetch test failed:', err));

    // Check active session on mount
    console.log('AuthContext: getSession started on mount');
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('AuthContext: getSession returned session:', session);
      try {
        await handleSession(session);
        console.log('AuthContext: getSession handleSession completed');
      } catch (err) {
        console.error('AuthContext: getSession handleSession failed:', err);
        setIsLoaded(true);
      }
    }).catch(err => {
      console.error('AuthContext: getSession promise rejected:', err);
      setIsLoaded(true);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthContext: onAuthStateChange event:', event, 'session:', session);
      if (event === 'SIGNED_IN') {
        const hasCache = localStorage.getItem('yadalearn-user-role') && localStorage.getItem('yadalearn-user');
        if (!hasCache) {
          setIsLoaded(false);
        }
      }
      try {
        await handleSession(session);
        console.log('AuthContext: onAuthStateChange handleSession completed');
      } catch (err) {
        console.error('AuthContext: onAuthStateChange handleSession failed:', err);
        setIsLoaded(true);
      } finally {
        if (event === 'SIGNED_IN') {
          isProcessingOAuth = false;
        }
      }
    });

    // Fallback timer: in case OAuth parsing fails or takes too long, set isLoaded to true after 2 seconds
    let timeoutId: any;
    if (hasHashToken) {
      timeoutId = setTimeout(() => {
        console.log('AuthContext: OAuth fallback timer fired, setting isLoaded to true');
        setIsLoaded(true);
      }, 2000);
    }

    return () => {
      subscription.unsubscribe();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const handleSession = async (session: any) => {
    console.log('AuthContext: handleSession start for user:', session?.user?.id);
    if (session?.user) {
      const u = session.user;
      
      // If we are already fetching/fetched this user's profile, skip database query
      if (fetchingUserIdRef.current === u.id) {
        console.log('AuthContext: Already fetching or fetched profile for user:', u.id);
        const savedUserStr = localStorage.getItem('yadalearn-user');
        let cachedUser: any = null;
        if (savedUserStr) {
          try {
            const parsed = JSON.parse(savedUserStr);
            if (parsed && parsed.id === u.id) {
              cachedUser = parsed;
            }
          } catch (e) {
            console.error(e);
          }
        }
        setUser(prev => prev || {
          id: u.id,
          email: u.email,
          name: cachedUser?.name || u.user_metadata?.full_name || u.email?.split('@')[0] || 'User',
          imageUrl: cachedUser?.imageUrl || u.user_metadata?.avatar_url,
          bio: cachedUser?.bio,
          country: cachedUser?.country
        });
        return;
      }
      
      fetchingUserIdRef.current = u.id;

      // Check cache to prevent flicker
      const savedUserStr = localStorage.getItem('yadalearn-user');
      let cachedUser: any = null;
      if (savedUserStr) {
        try {
          const parsed = JSON.parse(savedUserStr);
          if (parsed && parsed.id === u.id) {
            cachedUser = parsed;
          }
        } catch (e) {
          console.error(e);
        }
      }

      setUser({
        id: u.id,
        email: u.email,
        name: cachedUser?.name || u.user_metadata?.full_name || u.email?.split('@')[0] || 'User',
        imageUrl: cachedUser?.imageUrl || u.user_metadata?.avatar_url,
        bio: cachedUser?.bio,
        country: cachedUser?.country
      });

      if (cachedUser) {
        console.log('AuthContext: Found cached user, resolving isLoaded immediately');
        setIsLoaded(true);
      }

      try {
        console.log('AuthContext: Fetching profile for id:', u.id);
        
        // Wrap the Supabase query in a promise with a timeout (30s to allow for database cold starts)
        const queryPromise = supabase
          .from('profiles')
          .select('role, onboarding_completed, subjects, avatar_url, full_name, bio, country')
          .eq('id', u.id)
          .single();
 
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Profile fetch query timed out after 30 seconds')), 30000)
        );
 
        const { data: profile, error } = await Promise.race([queryPromise, timeoutPromise]) as any;
 
        if (error) {
          console.warn('AuthContext: Profile fetch returned error:', error);
        }
        console.log('AuthContext: Profile fetch completed, profile:', profile);
 
        if (profile) {
          if (profile.role) {
            setUserRoleState(profile.role as 'teacher' | 'student');
            localStorage.setItem('yadalearn-user-role', profile.role);
          } else {
            setUserRoleState(null);
            localStorage.removeItem('yadalearn-user-role');
          }
          setOnboardingCompletedState(!!profile.onboarding_completed);
          localStorage.setItem('yadalearn-onboarding-completed', String(!!profile.onboarding_completed));
          setSubjectsState(profile.subjects || []);
          
          const updatedUserObj = {
            id: u.id,
            email: u.email || '',
            name: profile.full_name || u.user_metadata?.full_name || u.email?.split('@')[0] || 'User',
            imageUrl: profile.avatar_url || u.user_metadata?.avatar_url,
            bio: profile.bio,
            country: profile.country
          };
          localStorage.setItem('yadalearn-user', JSON.stringify(updatedUserObj));
          setUser(updatedUserObj);
        } else {
          // If the profile query succeeded but returned null (no profile in DB) and there was no error, clear local storage
          if (!error) {
            setUserRoleState(null);
            setOnboardingCompletedState(false);
            setSubjectsState([]);
            localStorage.removeItem('yadalearn-user-role');
            localStorage.removeItem('yadalearn-onboarding-completed');
          }
          fetchingUserIdRef.current = null;
        }
      } catch (dbErr) {
        console.error('AuthContext: Database profile query failed (retaining cached localStorage role/onboarding states):', dbErr);
        fetchingUserIdRef.current = null;
      } finally {
        console.log('AuthContext: handleSession profile fetch completed, setting isLoaded to true');
        setIsLoaded(true);
      }
    } else {
      console.log('AuthContext: No session, clearing user data');
      setUser(null);
      setUserRoleState(null);
      setOnboardingCompletedState(false);
      setSubjectsState([]);
      localStorage.removeItem('yadalearn-user-role');
      localStorage.removeItem('yadalearn-onboarding-completed');
      fetchingUserIdRef.current = null;
      setIsLoaded(true);
    }
    console.log('AuthContext: handleSession end');
  };

  const login = async (email: string, password: string): Promise<void> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUpWithEmail = async (email: string, password: string, name: string): Promise<any> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    });
    if (error) throw error;
    return data;
  };

  const signInWithGoogle = async (): Promise<void> => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yxqezrvgvfwdgrlwczea.supabase.co';
    const redirectUrl = encodeURIComponent(window.location.origin + '/role-selection');
    const authUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${redirectUrl}&prompt=select_account`;
    window.location.assign(authUrl);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserRoleState(null);
    setOnboardingCompletedState(false);
    setSubjectsState([]);
    localStorage.removeItem('yadalearn-user-role');
    localStorage.removeItem('yadalearn-onboarding-completed');
    fetchingUserIdRef.current = null;
  };

  const setUserRole = async (role: 'teacher' | 'student' | null) => {
    setUserRoleState(role);
    if (role) {
      localStorage.setItem('yadalearn-user-role', role);
    } else {
      localStorage.removeItem('yadalearn-user-role');
    }
    if (role && user) {
      // Upsert role to Supabase profile
      await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        full_name: user.name,
        role: role,
        avatar_url: user.imageUrl
      }, { onConflict: 'id' });
    }
  };

  const setOnboardingCompleted = async (
    completed: boolean,
    selectedSubjects: string[] = [],
    onboardingAnswers: any = null,
    role: 'teacher' | 'student' | null = null
  ) => {
    setOnboardingCompletedState(completed);
    setSubjectsState(selectedSubjects);
    localStorage.setItem('yadalearn-onboarding-completed', String(completed));
    const activeRole = role || userRole;
    if (activeRole) {
      localStorage.setItem('yadalearn-user-role', activeRole);
    }
    if (user) {
      await supabase.from('profiles').update({
        onboarding_completed: completed,
        subjects: selectedSubjects
      }).eq('id', user.id);

      if (onboardingAnswers && activeRole) {
        if (activeRole === 'student') {
          await supabase.from('student_profiles').upsert({
            id: user.id,
            study_path: onboardingAnswers.studyPath,
            current_level: onboardingAnswers.currentLevel,
            learning_objective: onboardingAnswers.learningObjective,
            class_preference: onboardingAnswers.classPreference,
            time_availability: onboardingAnswers.timeAvailability,
            grade_level: onboardingAnswers.gradeLevel,
            study_goal: onboardingAnswers.studyGoal,
            study_preference: onboardingAnswers.studyPreference,
            study_schedule: onboardingAnswers.studySchedule
          });
        } else if (activeRole === 'teacher') {
          await supabase.from('teacher_profiles').upsert({
            id: user.id,
            teaching_focus: onboardingAnswers.teachingFocus,
            language_specialization: onboardingAnswers.languageSpecialization,
            subject_specialization: onboardingAnswers.subjectSpecialization,
            teaching_level: onboardingAnswers.teachingLevel,
            teaching_approach: onboardingAnswers.teachingApproach,
            lesson_format: onboardingAnswers.lessonFormat,
            availability: onboardingAnswers.availability,
            min_rate: onboardingAnswers.minRate ? parseInt(onboardingAnswers.minRate) : null,
            max_rate: onboardingAnswers.maxRate ? parseInt(onboardingAnswers.maxRate) : null,
            grade_level_focus: onboardingAnswers.gradeLevelFocus,
            teaching_style: onboardingAnswers.teachingStyle,
            class_type: onboardingAnswers.classType,
            schedule: onboardingAnswers.schedule
          });
        }
      }
    }
  };

  const clearUserRole = () => {
    setUserRoleState(null);
  };

  const refreshUser = async () => {
    if (user?.id) {
      fetchingUserIdRef.current = null; // reset to allow fetching
      const { data: { session } } = await supabase.auth.getSession();
      await handleSession(session);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoaded,
      userRole,
      onboardingCompleted,
      subjects,
      setUserRole,
      setOnboardingCompleted,
      clearUserRole,
      login,
      signUpWithEmail,
      signInWithGoogle,
      logout,
      refreshUser
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
