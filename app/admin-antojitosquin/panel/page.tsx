"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin/admin-layout"
import { useProducts } from "@/context/products-context"
import { useOrders } from "@/context/orders-context"
import { useAdminAuth } from "@/context/admin-auth-context"
import {
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Database,
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function AdminPanelPage() {
  const router = useRouter()
  const { isAuthenticated, isLoadingAuth } = useAdminAuth()
  const { products, loading } = useProducts()
  const { orders, getOrderStats } = useOrders()
  const stats = getOrderStats()
  const [seeding, setSeeding] = useState(false)
  const [seedMessage, setSeedMessage] = useState<string | null>(null)

  // 🔹 Verificación de sesión
  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      router.push("/admin-antojitosquin/panel")
    }
  }, [isAuthenticated, isLoadingAuth, router])

  // 🔹 Mientras se verifica la sesión, mostramos loader
  if (isLoadingAuth || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="ml-2 text-muted-foreground">Cargando datos...</span>
        </div>
      </AdminLayout>
    )
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)

  const handleSeedDatabase = async () => {
    setSeeding(true)
    setSeedMessage(null)
    try {
      const response = await fetch("/api/products/seed", { method: "POST" })
      const data = await response.json()
      setSeedMessage(data.message)
      window.location.reload()
    } catch (error) {
      setSeedMessage("Error al poblar la base de datos")
    } finally {
      setSeeding(false)
    }
  }

  const highDiscountProducts = products.filter((p) => {
    const discount = ((p.precioOriginal - p.precioFinal) / p.precioOriginal) * 100
    return discount >= 25
  })

  const recentOrders = orders.slice(0, 5)

  const statCards = [
    { label: "Total Productos", value: products.length, icon: Package, color: "bg-primary/10 text-primary" },
    { label: "Total Pedidos", value: stats.total, icon: ShoppingCart, color: "bg-accent/10 text-accent" },
    { label: "Ingresos", value: formatPrice(stats.ingresos), icon: DollarSign, color: "bg-lime/10 text-foreground" },
    { label: "Pendientes", value: stats.pendientes, icon: Clock, color: "bg-yellow/10 text-foreground" },
  ]

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Resumen general de tu tienda</p>
          </div>
          {products.length === 0 && (
            <button
              onClick={handleSeedDatabase}
              disabled={seeding}
              className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              {seeding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Database className="w-5 h-5" />}
              {seeding ? "Poblando..." : "Poblar Base de Datos"}
            </button>
          )}
        </div>

        {seedMessage && (
          <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
            <p className="text-foreground">{seedMessage}</p>
          </div>
        )}

        {products.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <Database className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Base de datos vacía</h2>
            <p className="text-muted-foreground mb-4">
              No hay productos en la base de datos. Haz clic en "Poblar Base de Datos" para cargar los productos iniciales desde el archivo JSON.
            </p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((stat, i) => {
                const Icon = stat.icon
                return (
                  <div key={i} className="bg-card rounded-xl border border-border p-5">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3", stat.color)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                )
              })}
            </div>

            {/* Restante del dashboard... (ordenes, alertas, etc.) */}
          </>
        )}
      </div>
    </AdminLayout>
  )
}
