"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Trash2, Minus, Plus, ShoppingBag } from "lucide-react"
import { StoreHeader } from "@/components/store-header"
import { useCart } from "@/context/cart-context"
import { cn } from "@/lib/utils"

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  // Lógica de envío según valor del carrito
  const shippingCost = totalPrice < 50000 ? 10000 : totalPrice < 100000 ? 5000 : 0
  const formatShipping = shippingCost === 0 ? "Gratis" : formatPrice(shippingCost)
  const totalWithShipping = totalPrice + shippingCost

  // Mensaje dinámico de incentivo más motivador
  let shippingMessage = ""
  if (totalPrice < 50000) {
    const diff = 50000 - totalPrice
    shippingMessage = `¡Estás cerca! Solo ${formatPrice(diff)} más y tu pedido tendrá envío por solo 5.000 COP.`
  } else if (totalPrice < 100000) {
    const diff = 100000 - totalPrice
    shippingMessage = `¡Casi llegas! Agrega ${formatPrice(diff)} más para disfrutar de envío gratis en tu pedido.`
  }

  return (
    <div className="min-h-screen bg-background">
      <StoreHeader />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-2 rounded-full hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Tu Carrito</h1>
          <span className="text-muted-foreground">({totalItems} productos)</span>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ShoppingBag className="w-20 h-20 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Tu carrito está vacío</h2>
            <p className="text-muted-foreground mb-6">Agrega productos para comenzar tu compra</p>
            <Link
              href="/"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Explorar productos
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const discount =
                  item.precioOriginal > item.precioFinal
                    ? Math.round(((item.precioOriginal - item.precioFinal) / item.precioOriginal) * 100)
                    : 0

                return (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 bg-card rounded-xl border border-border animate-slide-up"
                  >
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted shrink-0">
                      <Image src={item.imagen || "/placeholder.svg"} alt={item.nombre} fill className="object-cover" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/product/${item.id}`}
                        className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
                      >
                        {item.nombre}
                      </Link>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-lg font-bold text-primary">{formatPrice(item.precioFinal)}</span>
                        {discount > 0 && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(item.precioOriginal)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-border rounded-lg overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                            className="p-1.5 hover:bg-muted transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-3 py-1 font-medium min-w-[40px] text-center text-sm">
                            {item.cantidad}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                            className="p-1.5 hover:bg-muted transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-right hidden sm:block">
                      <span className="font-bold text-foreground">{formatPrice(item.precioFinal * item.cantidad)}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
                <h2 className="text-lg font-bold text-foreground mb-4">Resumen</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal ({totalItems} productos)</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>

                  <div className="flex flex-col">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Envío</span>
                      <span className="text-accent font-medium">{formatShipping}</span>
                    </div>
                    {shippingMessage && (
                      <p className="text-sm font-semibold mt-1 text-green-600">
                        {shippingMessage}
                      </p>
                    )}
                  </div>

                  <hr className="border-border" />
                  <div className="flex justify-between text-lg font-bold text-foreground">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(totalWithShipping)}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className={cn(
                    "w-full py-3 rounded-xl font-semibold text-center block",
                    "bg-primary text-primary-foreground",
                    "hover:bg-primary/90 transition-colors",
                  )}
                >
                  Hacer Pedido
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
