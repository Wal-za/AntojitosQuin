"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Definición de un producto en el carrito
export interface CartItem {
  id: number
  nombre: string
  precioFinal: number
  precioOriginal: number
  precioCompra: number
  imagen: string
  cantidad: number
  variante?: string
}

// Definición del contexto del carrito
interface CartContextType {
  items: CartItem[]
  addToCart: (product: Omit<CartItem, "cantidad">) => void
  removeFromCart: (id: number, variante?: string) => void
  updateQuantity: (id: number, cantidad: number, variante?: string) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
  cartAnimating: boolean
}

// Crear el contexto
const CartContext = createContext<CartContextType | undefined>(undefined)

// Proveedor del carrito
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [cartAnimating, setCartAnimating] = useState(false)

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem("antojitosquin-cart")
    if (savedCart) {
      setItems(JSON.parse(savedCart))
    }
  }, [])

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem("antojitosquin-cart", JSON.stringify(items))
  }, [items])

  // Función para agregar un producto al carrito
  const addToCart = (product: Omit<CartItem, "cantidad">) => {
    setCartAnimating(true)
    setTimeout(() => setCartAnimating(false), 300)

    setItems((prev) => {
      const existing = prev.find(
        (item) =>
          item.id === product.id &&
          (item.variante ?? "") === (product.variante ?? "")
      )

      if (existing) {
        return prev.map((item) =>
          item.id === product.id &&
          (item.variante ?? "") === (product.variante ?? "")
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
      }

      return [...prev, { ...product, cantidad: 1 }]
    })
  }

  // Función para eliminar un producto del carrito
  const removeFromCart = (id: number, variante?: string) => {
    setItems((prev) =>
      prev.filter(
        (item) =>
          item.id !== id || (item.variante ?? "") !== (variante ?? "")
      )
    )
  }

  // Función para actualizar la cantidad de un producto
  const updateQuantity = (id: number, cantidad: number, variante?: string) => {
    if (cantidad <= 0) {
      removeFromCart(id, variante)
      return
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === id && (item.variante ?? "") === (variante ?? "")
          ? { ...item, cantidad }
          : item
      )
    )
  }

  // Vaciar el carrito
  const clearCart = () => {
    setItems([])
  }

  // Total de items
  const totalItems = items.reduce((sum, item) => sum + item.cantidad, 0)

  // Total usando precioFinal
  const totalPrice = items.reduce(
    (sum, item) => sum + item.precioFinal * item.cantidad,
    0
  )

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        cartAnimating,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

// Hook para usar el carrito en cualquier componente
export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
