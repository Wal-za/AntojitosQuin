"use client"

import { AdminLayout } from "@/components/admin/admin-layout"
import { useProducts } from "@/context/products-context"
import { useOrders } from "@/context/orders-context"
import { TrendingUp, DollarSign, Package, ShoppingCart, Award } from "lucide-react"
import { cn } from "@/lib/utils"

export default function AdminStatsPage() {
  const { products } = useProducts()
  const { orders, getOrderStats } = useOrders()
  const stats = getOrderStats()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  // Calcular ventas y ganancias por producto
  const productSales: Record<number, { nombre: string; cantidad: number; ingresos: number; precioCompra: number }> = {}

  orders.forEach((order) => {
    if (order.estado !== "Cancelado") {
      order.productos.forEach((item) => {
        if (!productSales[item.id]) {
          productSales[item.id] = {
            nombre: item.nombre,
            cantidad: 0,
            ingresos: 0,
            precioCompra: item.precioCompra, // <-- asegurarnos de guardar precioCompra
          }
        }
        productSales[item.id].cantidad += item.cantidad
        productSales[item.id].ingresos += item.precioFinal * item.cantidad
      })
    }
  })

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5)

  // Calcular Ganancia Total
  const totalProfit = Object.values(productSales).reduce((acc, product) => {
    return acc + (product.ingresos - product.precioCompra * product.cantidad)
  }, 0)

  // Distribución por categoría
  const categoryStats: Record<string, number> = {}
  products.forEach((p) => {
    categoryStats[p.categoria] = (categoryStats[p.categoria] || 0) + 1
  })
  const totalCategoryProducts = Object.values(categoryStats).reduce((a, b) => a + b, 0)

  // Datos de estado de pedidos
  const statusData = [
    { label: "Pendientes", value: stats.pendientes, color: "bg-yellow" },
    { label: "En Proceso", value: stats.enProceso, color: "bg-primary" },
    { label: "Enviados", value: stats.enviados, color: "bg-accent" },
    { label: "Entregados", value: stats.entregados, color: "bg-lime" },
    { label: "Cancelados", value: stats.cancelados, color: "bg-destructive" },
  ]

  const maxStatusValue = Math.max(...statusData.map((s) => s.value), 1)

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Estadísticas</h1>
          <p className="text-muted-foreground">Análisis detallado de tu tienda</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Ingresos Totales */}
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Ingresos Totales</p>
            <p className="text-2xl font-bold text-foreground">{formatPrice(stats.ingresos)}</p>
          </div>

          {/* Ganancia Total */}
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5 text-green-700" />
            </div>
            <p className="text-sm text-muted-foreground">Ganancia Total</p>
            <p className="text-2xl font-bold text-foreground">{formatPrice(totalProfit)}</p>
          </div>

          {/* Ventas Completadas */}
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
              <ShoppingCart className="w-5 h-5 text-accent" />
            </div>
            <p className="text-sm text-muted-foreground">Ventas Completadas</p>
            <p className="text-2xl font-bold text-foreground">{stats.entregados}</p>
          </div>

          {/* Productos Activos */}
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="w-10 h-10 rounded-lg bg-lime/10 flex items-center justify-center mb-3">
              <Package className="w-5 h-5 text-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Productos Activos</p>
            <p className="text-2xl font-bold text-foreground">{products.length}</p>
          </div>

          {/* Promedio por Pedido */}
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="w-10 h-10 rounded-lg bg-pink/10 flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5 text-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Promedio por Pedido</p>
            <p className="text-2xl font-bold text-foreground">
              {stats.total > 0 ? formatPrice(stats.ingresos / (stats.total - stats.cancelados || 1)) : "$0"}
            </p>
          </div>
        </div>

        {/* Order Status & Category Distribution */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Order Status Chart */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-bold text-foreground mb-6">Estado de Pedidos</h2>
            <div className="space-y-4">
              {statusData.map((status) => (
                <div key={status.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-foreground">{status.label}</span>
                    <span className="text-sm font-medium text-foreground">{status.value}</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", status.color)}
                      style={{ width: `${(status.value / maxStatusValue) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-bold text-foreground mb-6">Productos por Categoría</h2>
            <div className="space-y-4">
              {Object.entries(categoryStats).map(([category, count], index) => {
                const colors = ["bg-primary", "bg-accent", "bg-lime", "bg-pink", "bg-yellow"]
                const percentage = Math.round((count / totalCategoryProducts) * 100)
                return (
                  <div key={category}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-foreground">{category}</span>
                      <span className="text-sm text-muted-foreground">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all", colors[index % colors.length])}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-6">
            <Award className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Productos Más Vendidos</h2>
          </div>

          {topProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border">
                    <th className="pb-3 font-medium w-6">#</th>
                    <th className="pb-3 font-medium">Producto</th>
                    <th className="pb-3 font-medium">Unidades</th>
                    <th className="pb-3 font-medium">Ingresos</th>
                    <th className="pb-3 font-medium">Ganancia</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((product, index) => {
                    const productProfit = product.ingresos - product.precioCompra * product.cantidad

                    return (
                      <tr key={product.nombre} className="border-b border-border last:border-0">
                        <td className="py-2">{index + 1}</td>
                        <td className="py-2 font-medium text-foreground">{product.nombre}</td>
                        <td className="py-2 text-foreground">{product.cantidad}</td>
                        <td className="py-2 font-medium text-primary">{formatPrice(product.ingresos)}</td>
                        <td className="py-2 font-medium text-green-700">{formatPrice(productProfit)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Aún no hay ventas registradas. Los datos aparecerán cuando se realicen pedidos.
            </p>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
