"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CheckCircle, Package, Mail, Home, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { getShippingCost } from "../../context/shipping";

export default function ConfirmationPage() {
  const [order, setOrder] = useState<any>(null)
  const [showConfetti, setShowConfetti] = useState(true)
  const [sparkles, setSparkles] = useState<
    { left: string; top: string; animationDelay: string; animationDuration: string }[] 
  >([])

  useEffect(() => {
    // Cargar último pedido desde localStorage
    const number = localStorage.getItem("antojitosquin-last-order")
    if (!number) return

    async function loadOrder() {
      const res = await fetch(`/api/orders/by-number?orderNumber=${number}`)
      const data = await res.json()
      if (data.success) setOrder(data.order)
    }

    loadOrder()

    // Generar posiciones y animaciones de los Sparkles solo en cliente
    setSparkles(
      Array.from({ length: 20 }).map(() => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 50}%`,
        animationDelay: `${Math.random() * 0.5}s`,
        animationDuration: `${1 + Math.random()}s`,
      }))
    )

    // Controlar animación de confetti
    const timer = setTimeout(() => setShowConfetti(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Confetti */}
      {showConfetti && sparkles.length > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          {sparkles.map((s, i) => (
            <Sparkles
              key={i}
              className={cn("absolute text-primary animate-bounce", "w-6 h-6")}
              style={{
                left: s.left,
                top: s.top,
                animationDelay: s.animationDelay,
                animationDuration: s.animationDuration,
              }}
            />
          ))}
        </div>
      )}

      <main className="max-w-2xl mx-auto px-4 py-12 relative z-50">
        {/* Icono */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-accent/20 flex items-center justify-center animate-bounce-small">
            <CheckCircle className="w-16 h-16 text-accent" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-foreground text-center mb-2 bg-white">
          ¡Pago Exitoso!
        </h1>
        <p className="text-muted-foreground text-center mb-8 bg-white">
          Gracias por tu compra. Tu pedido está siendo procesado.
        </p>

        {order && (
          <div className="bg-card rounded-xl border border-border p-6 mb-8 animate-slide-up bg-white">
            <div className="flex items-center gap-3 mb-4 bg-white">
              <Package className="w-6 h-6 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Número de pedido</p>
                <p className="font-mono font-bold text-foreground">{order.orderNumber}</p>
              </div>
            </div>

            <hr className="border-border my-4" />

            <h3 className="font-semibold text-foreground mb-3">Productos</h3>
            <div className="space-y-2 mb-4">
              {order.productos.map((item: any) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.nombre}{item.variante ? ` ${item.variante}` : ""} x{item.cantidad}
                  </span>
                  <span className="text-foreground">{formatPrice(item.precioFinal * item.cantidad)}</span>
                </div>
              ))}
            </div>

            <hr className="border-border my-4" />

            {/* Envío */}
            <div className="flex justify-between text-sm mb-2">
              <span className="text-foreground font-semibold">Envío</span>
              <span className={cn("font-semibold", getShippingCost(order.total) === 0 ? "text-green-600" : "text-foreground")}>
                {getShippingCost(order.total) === 0
                  ? "Gratis"
                  : formatPrice(getShippingCost(order.total))}
              </span>
            </div>

            <hr className="border-border my-4" />

            <div className="flex justify-between font-bold text-lg">
              <span className="text-foreground">Total pagado</span>
              <span className="text-primary">{formatPrice(order.total)}</span> {/* Ya incluye el envío */}
            </div>

            <hr className="border-border my-4" />

            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Mail className="w-5 h-5" />
              <span>
                Hemos enviado la confirmación a{" "}
                <strong className="text-foreground">{order.cliente.correo}</strong>
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/"
            className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-center flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
          >
            <Home className="w-5 h-5" />
            Volver al Inicio
          </Link>
        </div>
      </main>
    </div>
  )
}
