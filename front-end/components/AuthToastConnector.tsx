"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { setUnauthorizedHandler } from "@/lib/api";

export function AuthToastConnector() {
  const router = useRouter();
  const { setToken, setUser } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    // Set up global handler for 401 errors with toast support
    setUnauthorizedHandler((message?: string) => {
      // Clear auth state
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
      setToken(null);
      setUser(null);
      
      // Show toast message
      if (message) {
        showToast(message, "warning");
      } else {
        showToast("Ваш сеанс закінчився. Будь ласка, увійдіть знову.", "warning");
      }
      
      // Redirect to login
      router.push("/auth/login");
    });
  }, [router, showToast, setToken, setUser]);

  return null;
}

