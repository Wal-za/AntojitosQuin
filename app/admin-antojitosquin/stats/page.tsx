"use client"

import { AdminLayout } from "@/components/admin/admin-layout"
import { useProducts } from "@/context/products-context"
import { useOrders } from "@/context/orders-context"
import {
  TrendingUp,
  DollarSign,
  Package,
  ShoppingCart,
  Award,
  CreditCard,
} from "lucide-react"
import { cn } from "@/lib/utils"

type PaymentStats = {
  pedidos: number
  ingresos: number
}

export default function AdminStatsPage() {
  const { products } = useProducts()
  const { orders, getOrderStats } = useOrders()
  const stats = getOrderStats()

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)

  /* =========================
     VENTAS Y GANANCIAS
  ========================== */
  const productSales: Record<
    number,
    { nombre: string; cantidad: number; ingresos: number; precioCompra: number }
  > = {}

  orders.forEach((order) => {
    if (order.estado === "Cancelado") return

    order.productos.forEach((item) => {
      if (!productSales[item.id]) {
        productSales[item.id] = {
          nombre: item.nombre,
          cantidad: 0,
          ingresos: 0,
          precioCompra: item.precioCompra,
        }
      }

      productSales[item.id].cantidad += item.cantidad
      productSales[item.id].ingresos += item.precioFinal * item.cantidad
    })
  })

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5)

  const totalProfit = Object.values(productSales).reduce(
    (acc, p) => acc + (p.ingresos - p.precioCompra * p.cantidad),
    0
  )

  /* =========================
     INGRESOS POR MÉTODO DE PAGO
  ========================== */
  const confirmedPayments: Record<string, PaymentStats> = {}
  const pendingPayments: Record<string, PaymentStats> = {}

  orders.forEach((order) => {
    if (order.estado === "Cancelado") return

    const metodo = order.metodoPago || "No especificado"
    const target =
      order.estado === "Entregado" ? confirmedPayments : pendingPayments

    if (!target[metodo]) {
      target[metodo] = { pedidos: 0, ingresos: 0 }
    }

    target[metodo].pedidos += 1
    target[metodo].ingresos += order.total
  })

  /* =========================
     CATEGORÍAS
  ========================== */
  const categoryStats: Record<string, number> = {}
  products.forEach((p) => {
    categoryStats[p.categoria] = (categoryStats[p.categoria] || 0) + 1
  })
  const totalCategoryProducts = Object.values(categoryStats).reduce(
    (a, b) => a + b,
    0
  )

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
        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold">Estadísticas</h1>
          <p className="text-muted-foreground">
            Control financiero y análisis del negocio
          </p>
        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <SummaryCard
            icon={<DollarSign />}
            title="Ingresos Totales"
            value={formatPrice(stats.ingresos)}
          />
          <SummaryCard
            icon={<TrendingUp />}
            title="Ganancia Total"
            value={formatPrice(totalProfit)}
          />
          <SummaryCard
            icon={<ShoppingCart />}
            title="Ventas Entregadas"
            value={stats.entregados}
          />
          <SummaryCard
            icon={<Package />}
            title="Productos Activos"
            value={products.length}
          />
          <SummaryCard
            icon={<TrendingUp />}
            title="Promedio por Pedido"
            value={
              stats.entregados > 0
                ? formatPrice(stats.ingresos / stats.entregados)
                : "$0"
            }
          />
        </div>

        {/* ESTADOS + CATEGORÍAS */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card border rounded-xl p-6">
            <h2 className="font-bold mb-6">Estado de Pedidos</h2>
            {statusData.map((s) => (
              <div key={s.label} className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>{s.label}</span>
                  <span>{s.value}</span>
                </div>
                <div className="h-3 bg-muted rounded-full">
                  <div
                    className={cn("h-full rounded-full", s.color)}
                    style={{ width: `${(s.value / maxStatusValue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-card border rounded-xl p-6">
            <h2 className="font-bold mb-6">Productos por Categoría</h2>
            {Object.entries(categoryStats).map(([cat, count]) => {
              const pct = Math.round((count / totalCategoryProducts) * 100)
              return (
                <div key={cat} className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{cat}</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* MÉTODOS DE PAGO */}
        <PaymentTable
          title="Ingresos Confirmados (Entregados)"
          data={confirmedPayments}
          formatPrice={formatPrice}
        />
        <PaymentTable
          title="Ingresos por Confirmar (Pendientes / Proceso)"
          data={pendingPayments}
          formatPrice={formatPrice}
        />

        {/* TOP PRODUCTS */}
        <div className="bg-card border rounded-xl p-6">
          <div className="flex gap-2 items-center mb-6">
            <Award className="text-primary" />
            <h2 className="font-bold">Productos Más Vendidos</h2>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="text-left pb-2">Producto</th>
                <th className="text-center pb-2">Und</th>
                <th className="text-center pb-2">Ventas</th>
                <th className="text-center pb-2">Ganancia</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p) => {
                const profit =
                  p.ingresos - p.precioCompra * p.cantidad
                return (
                  <tr key={p.nombre} className="border-b last:border-0">
                    <td className="py-2">{p.nombre}</td>
                    <td className="text-center">{p.cantidad}</td>
                    <td className="text-center text-primary">
                      {formatPrice(p.ingresos)}
                    </td>
                    <td className="text-center text-green-700">
                      {formatPrice(profit)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}

/* =========================
   COMPONENTES REUTILIZABLES
========================== */

function SummaryCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode
  title: string
  value: string | number
}) {
  return (
    <div className="bg-card border rounded-xl p-5">
      <div className="w-10 h-10 mb-3 flex items-center justify-center rounded-lg bg-primary/10">
        {icon}
      </div>
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}

function PaymentTable({
  title,
  data,
  formatPrice,
}: {
  title: string
  data: Record<string, PaymentStats>
  formatPrice: (v: number) => string
}) {
  return (
    <div className="bg-card border rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <CreditCard className="text-primary" />
        <h2 className="font-bold">{title}</h2>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-muted-foreground">
            <th className="text-left pb-2">Método</th>
            <th className="text-center pb-2">Pedidos</th>
            <th className="text-right pb-2">Ingresos</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(data).map(([method, info]) => (
            <tr key={method} className="border-b last:border-0">
              <td className="py-2">{method}</td>
              <td className="text-center">{info.pedidos}</td>
              <td className="text-right font-medium text-primary">
                {formatPrice(info.ingresos)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
