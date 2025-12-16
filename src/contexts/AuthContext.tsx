import { createContext, useContext, useState, useEffect } from 'react';
import { useUser, useClerk } from "@clerk/clerk-react";

interface User {
  id: string; // Added ID for Supabase
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isLoaded: boolean;
  userRole: 'teacher' | 'student' | null;
  setUserRole: (role: 'teacher' | 'student' | null) => void;
  clearUserRole: () => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const { signOut, openSignIn } = useClerk();

  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRoleState] = useState<'teacher' | 'student' | null>(null);

  // Sync Clerk user with local User state
  useEffect(() => {
    if (clerkUser) {
      setUser({
        id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        name: clerkUser.fullName || '',
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
        imageUrl: clerkUser.imageUrl,
      });
    } else {
      setUser(null);
    }
  }, [clerkUser]);

  // Load role from localStorage on mount
  useEffect(() => {
    const savedRole = localStorage.getItem('yadalearn-user-role');
    if (savedRole && (savedRole === 'teacher' || savedRole === 'student')) {
      setUserRoleState(savedRole as 'teacher' | 'student');
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    // For Clerk, "login" typically opens the modal or redirects.
    // We can use openSignIn() here.
    return openSignIn();
  };

  const logout = () => {
    signOut();
    setUser(null);
    setUserRoleState(null);
    localStorage.removeItem('yadalearn-user-role');
  };

  const setUserRole = (role: 'teacher' | 'student' | null) => {
    setUserRoleState(role);
    if (role) {
      localStorage.setItem('yadalearn-user-role', role);
    } else {
      localStorage.removeItem('yadalearn-user-role');
    }
  };

  const clearUserRole = () => {
    setUserRoleState(null);
    localStorage.removeItem('yadalearn-user-role');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoaded: isClerkLoaded,
      userRole,
      setUserRole,
      clearUserRole,
      login, // Now opens Clerk sign in
      logout,
      refreshUser: () => {
        // No-op for Clerk as it handles state automatically, 
        // but keeping for interface compatibility if needed.
      }
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
