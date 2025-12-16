"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, ApiError, setUnauthorizedHandler } from "@/lib/api";

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "employer" | "jobseeker";
  imageUrl?: string;
  description?: string;
  contacts?: { email?: string; phone?: string };
  employerProfile?: {
    companyName?: string;
    companyWebsite?: string;
    companyDescription?: string;
  };
  jobseekerProfile?: {
    stack: string[];
    portfolioUrls?: string[];
    cvUrls?: string[];
    openToWork: boolean;
    preferences: {
      employmentTypes: string[];
      workModes: string[];
    };
    studies: any[];
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      refreshUser();
    } else {
      setLoading(false);
    }
  }, []);

  const refreshUser = async () => {
    try {
      const userData = await api.auth.me();
      setUser(userData);
    } catch (error) {
      // If 401, the global handler will redirect
      if (error instanceof ApiError && error.status === 401) {
        // Already handled by global handler
        return;
      }
      console.error("Failed to refresh user:", error);
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.auth.login({ email, password });
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem("token", response.token);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error("Login failed");
    }
  };

  const register = async (data: any) => {
    try {
      const response = await api.auth.register(data);
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem("token", response.token);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error("Registration failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    api.auth.logout().catch(() => {});
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout, refreshUser, setToken, setUser }}
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

