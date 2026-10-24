"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useAdminLoginMutation, useLazyAdminMeQuery } from "@/store/adminApi";
import { apiError } from "@/store/apiError";

interface Admin {
  email: string;
  name: string;
}

interface AuthState {
  admin: Admin | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
}

const AdminAuthContext = createContext<AuthState | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginRequest] = useAdminLoginMutation();
  const [loadMe] = useLazyAdminMeQuery();

  useEffect(() => {
    const saved = localStorage.getItem("admin_token");
    if (!saved) {
      setIsLoading(false);
      return;
    }
    loadMe()
      .unwrap()
      .then((data) => {
        setAdmin({ email: data.email, name: data.name });
        setToken(saved);
      })
      .catch(() => {
        localStorage.removeItem("admin_token");
      })
      .finally(() => setIsLoading(false));
  }, [loadMe]);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const data = await loginRequest({ email, password }).unwrap();
        localStorage.setItem("admin_token", data.token);
        setToken(data.token);
        setAdmin(data.admin);
        return null;
      } catch (err) {
        return apiError(err, "Network error. Is the server running?");
      }
    },
    [loginRequest]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("admin_token");
    setToken(null);
    setAdmin(null);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ admin, token, isLoading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
