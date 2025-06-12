"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import {
  login as loginApi,
  register as registerApi,
  getCurrentUser,
  logout as logoutApi,
  type User,
} from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string,
    fullName: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error("Failed to get user data:", error);
        localStorage.removeItem("user");
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (identifier: string, password: string) => {
    try {
      setIsLoading(true);
      const { user } = await loginApi(identifier, password);

      // Store user data in localStorage since backend doesn't provide JWT
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);

      toast({
        title: "Login successful",
        description: `Welcome back, ${user.fullName || user.username}!`,
      });
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description:
          error instanceof Error
            ? error.message
            : "Please check your credentials.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    fullName: string
  ) => {
    try {
      setIsLoading(true);
      const { user } = await registerApi(username, email, password, fullName);

      // Store user data in localStorage
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);

      toast({
        title: "Registration successful",
        description: `Welcome, ${user.fullName || user.username}!`,
      });
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description:
          error instanceof Error
            ? error.message
            : "Please try again with different credentials.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
      localStorage.removeItem("user");
      setUser(null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
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
