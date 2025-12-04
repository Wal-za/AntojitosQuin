"use client"

import { useState, useMemo } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { useOrders, type OrderStatus, type Order } from "@/context/orders-context"
import { Eye, X, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const statusOptions: OrderStatus[] = ["Pendiente", "En proceso", "Enviado", "Entregado", "Cancelado"]

const statusColors: Record<OrderStatus, string> = {
  Pendiente: "bg-yellow/20 text-foreground",
  "En proceso": "bg-primary/20 text-primary",
  Enviado: "bg-accent/20 text-accent-foreground",
  Entregado: "bg-lime/20 text-foreground",
  Cancelado: "bg-destructive/20 text-destructive",
}

const PAGE_SIZE = 20

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus } = useOrders()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "Todos">("Todos")
  const [currentPage, setCurrentPage] = useState(1)

  // Filtrar y ordenar las órdenes
  const filteredOrders = useMemo(() => {
    const filtered = filterStatus === "Todos" ? orders : orders.filter((o) => o.estado === filterStatus)
    // Ordenar por fecha descendente (más recientes primero)
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [orders, filterStatus])

  // Calcular total de páginas
  const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE)

  // Obtener solo las órdenes de la página actual
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1)
  }

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pedidos</h1>
          <p className="text-muted-foreground">{orders.length} pedidos en total</p>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setFilterStatus("Todos"); setCurrentPage(1) }}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              filterStatus === "Todos"
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border hover:bg-muted text-foreground",
            )}
          >
            Todos ({orders.length})
          </button>
          {statusOptions.map((status) => {
            const count = orders.filter((o) => o.estado === status).length
            return (
              <button
                key={status}
                onClick={() => { setFilterStatus(status); setCurrentPage(1) }}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  filterStatus === status
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border hover:bg-muted text-foreground",
                )}
              >
                {status} ({count})
              </button>
            )
          })}
        </div>

        {/* Orders Table (desktop) */}
        {paginatedOrders.length > 0 ? (
          <>
            <div className="overflow-x-auto hidden md:block">
              <table className="w-full table-auto">
                <thead className="bg-muted">
                  <tr className="text-left text-sm text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Número de Pedido</th>
                    <th className="px-4 py-3 font-medium">Cliente</th>
                    <th className="px-4 py-3 font-medium">Fecha</th>
                    <th className="px-4 py-3 font-medium">Total</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                    <th className="px-4 py-3 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((order) => (
                    <tr key={order.orderNumber} className="border-t border-border hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-sm text-foreground break-words min-w-0">{order.orderNumber}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{order.cliente.nombre}</p>
                        <p className="text-xs text-muted-foreground">{order.cliente.correo}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">{formatDate(order.createdAt)}</td>
                      <td className="px-4 py-3 font-medium text-foreground">{formatPrice(order.total)}</td>
                      <td className="px-4 py-3">
                        <div className="relative inline-block">
                          <select
                            value={order.estado}
                            onChange={(e) => updateOrderStatus(order._id, e.target.value as OrderStatus)}
                            className={cn(
                              "appearance-none px-3 py-1.5 pr-8 rounded-lg text-sm font-medium cursor-pointer",
                              "focus:outline-none focus:ring-2 focus:ring-primary/50",
                              statusColors[order.estado],
                            )}
                          >
                            {statusOptions.map((status) => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 rounded-lg hover:bg-muted transition-colors"
                        >
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Orders Cards (mobile) */}
            <div className="md:hidden flex flex-col gap-4">
              {paginatedOrders.map((order) => (
                <div key={order.orderNumber} className="bg-card border border-border rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-foreground">Pedido #{order.orderNumber}</span>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Cliente:</p>
                    <p className="font-medium text-foreground">{order.cliente.nombre}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Total:</p>
                    <p className="font-medium text-foreground">{formatPrice(order.total)}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Fecha:</p>
                    <p className="text-foreground">{formatDate(order.createdAt)}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Estado:</p>
                    <select
                      value={order.estado}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value as OrderStatus)}
                      className={cn(
                        "appearance-none w-full px-3 py-1.5 pr-8 rounded-lg text-sm font-medium cursor-pointer",
                        "focus:outline-none focus:ring-2 focus:ring-primary/50",
                        statusColors[order.estado],
                      )}
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-end mt-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center items-center gap-4 mt-4">
              <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className={cn(
                  "px-4 py-2 rounded-lg border hover:bg-muted transition-colors",
                  currentPage === 1 && "opacity-50 cursor-not-allowed"
                )}
              >
                Anterior
              </button>
              <span>Página {currentPage} de {totalPages}</span>
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className={cn(
                  "px-4 py-2 rounded-lg border hover:bg-muted transition-colors",
                  currentPage === totalPages && "opacity-50 cursor-not-allowed"
                )}
              >
                Siguiente
              </button>
            </div>
          </>
        ) : (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <p className="text-muted-foreground">
              No hay pedidos {filterStatus !== "Todos" && `con estado "${filterStatus}"`}
            </p>
          </div>
        )}

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card">
                <h2 className="text-lg font-bold text-foreground">Detalle del Pedido</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Número de Pedido</p>
                  <p className="font-mono text-foreground break-all">{selectedOrder.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha</p>
                  <p className="text-foreground">{formatDate(selectedOrder.createdAt)}</p>
                </div>
                <hr className="border-border" />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Datos del Cliente</p>
                  <div className="bg-muted rounded-lg p-3 space-y-1">
                    <p className="text-foreground"><strong>Nombre:</strong> {selectedOrder.cliente.nombre}</p>
                    <p className="text-foreground"><strong>Teléfono:</strong> {selectedOrder.cliente.telefono}</p>
                    <p className="text-foreground"><strong>Correo:</strong> {selectedOrder.cliente.correo}</p>
                    <p className="text-foreground"><strong>Dirección:</strong> {selectedOrder.cliente.direccion}</p>
                  </div>
                </div>
                <hr className="border-border" />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Productos</p>
                  <div className="space-y-2">
                    {selectedOrder.productos.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-2 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium text-foreground">{item.nombre}</p>
                          <p className="text-sm text-muted-foreground">Cantidad: {item.cantidad}</p>
                        </div>
                        <p className="font-medium text-foreground">{formatPrice(item.precioFinal * item.cantidad)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <hr className="border-border" />
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg text-foreground">Total</span>
                  <span className="font-bold text-lg text-primary">{formatPrice(selectedOrder.total)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Método de pago</span>
                  <span className="text-foreground">{selectedOrder.metodoPago}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Estado</span>
                  <span className={cn("px-3 py-1 rounded-lg text-sm font-medium", statusColors[selectedOrder.estado])}>
                    {selectedOrder.estado}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
