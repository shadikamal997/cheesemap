'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'ADMIN' | 'SHOP' | 'FARM' | 'VISITOR';
  emailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Get user info from token
  const fetchUser = async (token: string) => {
    try {
      const response = await fetch('/api/auth/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        return true;
      } else if (response.status === 401) {
        // Token expired, try to refresh
        return await refreshAccessToken();
      } else {
        // Other error, clear tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
        return false;
      }
    } catch (error) {
      // User fetch failed - handle silently
      setUser(null);
      return false;
    }
  };

  // Refresh access token using refresh token
  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        return false;
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.accessToken);
        
        // Fetch user with new token
        const newToken = data.accessToken;
        const userResponse = await fetch('/api/auth/user', {
          headers: {
            'Authorization': `Bearer ${newToken}`,
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData.user);
          return true;
        }
      }
      
      // Refresh failed, clear everything
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      return false;
    } catch (error) {
      // Token refresh failed - clear auth
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      return false;
    }
  };

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      
      if (token) {
        const success = await fetchUser(token);
        if (success && user && !user.emailVerified) {
          // Redirect unverified users to verification page
          router.push('/verify-email-pending');
        }
        await fetchUser(token);
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    
    // Store tokens in localStorage
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    
    // Set cookie for middleware access (15 min expiry for access token)
    if (typeof document !== 'undefined') {
      document.cookie = `accessToken=${data.accessToken}; path=/; max-age=900; SameSite=Lax`;
    }
    
    // Set user
    setUser(data.user);

    // Check if user has a pending business signup (shop/farm without business)
    const pendingRole = sessionStorage.getItem('pendingRole');
    const role = data.user.role.toLowerCase();
    
    if (pendingRole && (role === 'shop' || role === 'farm')) {
      // Check if user has a business
      const businessResponse = await fetch('/api/businesses', {
        headers: {
          'Authorization': `Bearer ${data.accessToken}`
        }
      });
      
      if (businessResponse.ok) {
        const businessData = await businessResponse.json();
        
        // If no businesses found, redirect to complete signup
        if (!businessData.businesses || businessData.businesses.length === 0) {
          sessionStorage.removeItem('pendingRole');
          router.push(`/signup/business?role=${role}`);
          return;
        }
      }
      
      sessionStorage.removeItem('pendingRole');
    }

    // Redirect based on role
    router.push(`/dashboard/${role}`);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // Clear cookie
    if (typeof document !== 'undefined') {
      document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        isEmailVerified: !!(user && user.emailVerified),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
