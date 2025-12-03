"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { CartItem } from "./cart-context"

export type OrderStatus = "Pendiente" | "En proceso" | "Enviado" | "Entregado" | "Cancelado"

export interface Order {
  _id?: string
  orderNumber: string
  cliente: {
    nombre: string
    direccion: string
    telefono: string
    correo: string
  }
  productos: CartItem[]
  total: number
  estado: OrderStatus
  metodoPago: string
  createdAt: string
}

interface OrdersContextType {
  orders: Order[]
  addOrder: (order: Omit<Order, "_id" | "orderNumber" | "createdAt">) => Promise<string>
  updateOrderStatus: (id: string, estado: OrderStatus) => Promise<void>
  getOrderById: (id: string) => Order | undefined
  getOrderStats: () => {
    total: number
    pendientes: number
    enProceso: number
    enviados: number
    entregados: number
    cancelados: number
    ingresos: number
  }
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined)

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([])

  // Obtener todos los pedidos al iniciar
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const url = new URL("/api/orders/get", window.location.origin).toString()
        const res = await fetch(url, { cache: "no-store" })
        if (!res.ok) {
          const text = await res.text()
          console.error("Respuesta no OK:", text)
          throw new Error("Error al obtener pedidos")
        }
        const data: Order[] = await res.json()
        setOrders(data)
      } catch (error) {
        console.error("Error al cargar pedidos:", error)
      }
    }
    fetchOrders()
  }, [])

  // Agregar un nuevo pedido
  const addOrder = async (order: Omit<Order, "_id" | "orderNumber" | "createdAt">) => {
    try {
      const url = new URL("/api/orders/add", window.location.origin).toString()
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      })
      if (!res.ok) {
        const text = await res.text()
        console.error("Error POST /api/orders/add:", text)
        throw new Error("Error al agregar pedido")
      }
      const savedOrder: Order = await res.json()
      setOrders((prev) => [savedOrder, ...prev])
      return savedOrder._id!
    } catch (error) {
      console.error("Error en addOrder:", error)
      throw error
    }
  }

  // Actualizar estado de un pedido
  const updateOrderStatus = async (id: string, estado: OrderStatus) => {
    try {
      const url = new URL("/api/orders/update", window.location.origin).toString()
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, estado }),
      })
      if (!res.ok) {
        const text = await res.text()
        console.error("Error PUT /api/orders/update:", text)
        throw new Error("Error al actualizar estado")
      }
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, estado } : o))
      )
    } catch (error) {
      console.error("Error en updateOrderStatus:", error)
      throw error
    }
  }

  const getOrderById = (id: string) => orders.find((o) => o._id === id)

  const getOrderStats = () => {
    const completedOrders = orders.filter((o) => o.estado !== "Cancelado")
    return {
      total: orders.length,
      pendientes: orders.filter((o) => o.estado === "Pendiente").length,
      enProceso: orders.filter((o) => o.estado === "En proceso").length,
      enviados: orders.filter((o) => o.estado === "Enviado").length,
      entregados: orders.filter((o) => o.estado === "Entregado").length,
      cancelados: orders.filter((o) => o.estado === "Cancelado").length,
      ingresos: completedOrders.reduce((sum, o) => sum + o.total, 0),
    }
  }

  return (
    <OrdersContext.Provider
      value={{ orders, addOrder, updateOrderStatus, getOrderById, getOrderStats }}
    >
      {children}
    </OrdersContext.Provider>
  )
}

export function useOrders() {
  const context = useContext(OrdersContext)
  if (!context) throw new Error("useOrders must be used within an OrdersProvider")
  return context
}
