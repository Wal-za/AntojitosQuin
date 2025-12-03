"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Lock, User, Eye, EyeOff, AlertCircle } from "lucide-react"
import { useAdminAuth } from "@/context/admin-auth-context"
import { cn } from "@/lib/utils"

export default function AdminLoginPage() {
  const router = useRouter()
  const { login, isAuthenticated, isLoadingAuth } = useAdminAuth() // ← agregamos isLoadingAuth
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // 🔹 Redirección segura usando useEffect
  useEffect(() => {
    if (!isLoadingAuth && isAuthenticated) {
      router.push("/admin-antojitosquin/panel")
    }
  }, [isAuthenticated, isLoadingAuth, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Simulación de espera
    await new Promise((resolve) => setTimeout(resolve, 500))

    // login es async, hay que usar await
    const success = await login(username, password)

    if (success) {
      router.push("/admin-antojitosquin/panel")
    } else {
      setError("Usuario o contraseña incorrectos")
      setIsLoading(false)
    }
  }

  // 🔹 Mientras se verifica la sesión, mostramos un loader
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  // 🔹 Si ya está autenticado, no renderizamos nada
  if (isAuthenticated) return null

  // 🔹 Renderizamos el formulario solo si NO está autenticado
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl border border-border shadow-lg p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
              <Lock className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-foreground text-center mb-2">Panel Administrativo</h1>
          <p className="text-muted-foreground text-center mb-8">AntojitosQuin</p>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-6 bg-destructive/10 text-destructive rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-foreground mb-2">Usuario</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full px-4 py-3 pl-12 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pl-12 pr-12 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full py-3 rounded-xl font-semibold text-lg transition-all",
                "bg-primary text-primary-foreground hover:bg-primary/90",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            >
              {isLoading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-6">Acceso restringido solo para administradores</p>
        </div>
      </div>
    </div>
  )
}
