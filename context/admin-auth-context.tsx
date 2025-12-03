"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface AdminAuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verifica la sesión al cargar el cliente
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/admin/session");
        if (res.ok) {
          const data = await res.json();
          setIsAuthenticated(data.isAuthenticated);
        }
      } catch (error) {
        console.error("Error verificando la sesión:", error);
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  // Login vía API
  const login = async (username: string, password: string) => {
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        setIsAuthenticated(true);
        return true;
      }
    } catch (error) {
      console.error("Error en login:", error);
    }

    setIsAuthenticated(false);
    return false;
  };

  // Logout vía API
  const logout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch (error) {
      console.error("Error en logout:", error);
    }
    setIsAuthenticated(false);
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

// Hook personalizado para usar el contexto
export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
