"use client";

import type React from "react";
import { createContext, useContext, useState } from "react";
import {
  login as loginApi,
  register as registerApi,
  type User,
} from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
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
  const [token, setToken] = useState<string | null>(
    typeof window !== "undefined" ? localStorage.getItem("token") : null
  );
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Optionally, restore user info from backend using token here

  const login = async (identifier: string, password: string) => {
    try {
      setIsLoading(true);
      const { user, token } = await loginApi(identifier, password);

      setUser(user);
      setToken(token);
      localStorage.setItem("token", token);

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
      const { user, token } = await registerApi(username, email, password, fullName);

      setUser(user);
      setToken(token);
      localStorage.setItem("token", token);

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
      setUser(null);
      setToken(null);
      localStorage.removeItem("token");
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
        isAuthenticated: !!user && !!token,
        token,
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
