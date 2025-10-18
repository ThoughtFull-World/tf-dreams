"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";

interface User {
  id: string;
  email: string;
  username?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username?: string) => Promise<void>;
  signInAnonymously: () => Promise<void>;
  sendMagicLink: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  magicLinkSent?: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create Supabase client outside component to prevent recreation
const createSupabaseClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  // Memoize supabase client
  const supabase = useMemo(() => createSupabaseClient(), []);

  // Initialize auth and listen for changes
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("❌ Session error:", sessionError);
        }
        
        if (isMounted) {
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email || "",
              username: session.user.user_metadata?.username,
            });
          }
        }
      } catch (error) {
        console.error("❌ Failed to initialize auth:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (isMounted) {
          // Only update state for relevant events
          if (event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "USER_UPDATED") {
            if (session?.user) {
              setUser({
                id: session.user.id,
                email: session.user.email || "",
                username: session.user.user_metadata?.username,
              });
            }
          } else if (event === "SIGNED_OUT") {
            setUser(null);
          }
        }
      }
    );

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [supabase]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || "",
          username: data.user.user_metadata?.username,
        });
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, username?: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || "",
          username: username,
        });
      }
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInAnonymously = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInAnonymously();

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || `anonymous-${data.user.id.slice(0, 8)}`,
          username: "Guest",
        });
      }
    } catch (error) {
      console.error("Anonymous sign-in failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const sendMagicLink = async (email: string) => {
    setIsLoading(true);
    setMagicLinkSent(false);
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error("Supabase URL not configured");
      }

      const response = await fetch(
        `${supabaseUrl}/functions/v1/magic-link`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send magic link");
      }

      setMagicLinkSent(true);
    } catch (error) {
      console.error("Magic link failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error.message);
      }
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        signInAnonymously,
        sendMagicLink,
        logout,
        setUser,
        magicLinkSent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
