"use client";

import { createContext, useContext, useState, useSyncExternalStore, type ReactNode } from "react";

interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isHydrated: boolean;
  setUser: (user: AuthUser | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isHydrated: false,
  setUser: () => {},
  setToken: () => {},
  logout: () => {},
});

const noopSubscribe = () => () => {};

export function AuthProvider({ children }: { children: ReactNode }) {
  const isHydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);

  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem("auth_user");
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
  });

  const handleSetUser = (user: AuthUser | null) => {
    setUser(user);
    if (user) {
      localStorage.setItem("auth_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("auth_user");
    }
  };

  const handleSetToken = (newToken: string | null) => {
    setToken(newToken);
    if (newToken) {
      localStorage.setItem("auth_token", newToken);
    } else {
      localStorage.removeItem("auth_token");
    }
  };

  const logout = () => {
    handleSetUser(null);
    handleSetToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isHydrated, setUser: handleSetUser, setToken: handleSetToken, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
