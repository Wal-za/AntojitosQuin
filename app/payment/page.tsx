"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Smartphone, Building2 } from "lucide-react"
import { StoreHeader } from "@/components/store-header"
import { useCart } from "@/context/cart-context"
import { getShippingCost, getShippingMessage } from "../../context/shipping";
import { cn } from "@/lib/utils"

// --- Métodos de pago actualizados ---
const paymentMethods = [
  { id: "cash", name: "Contra entrega (Efectivo)", icon: Smartphone },
  { id: "nequi", name: "Transferencia a Nequi", icon: Smartphone },
  { id: "bancolombia", name: "Transferencia Bancolombia", icon: Building2 },
]

export default function PaymentPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCart()
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [checkoutData, setCheckoutData] = useState<{
    nombre: string
    direccion: string
    telefono: string
    correo: string
  } | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem("antojitosquin-checkout")
    if (saved) {
      setCheckoutData(JSON.parse(saved))
    } else {
      router.push("/checkout")
    }
  }, [router])

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(price)

  // --- Envío dinámico ---
  const shippingCost = getShippingCost(totalPrice)
  const totalWithShipping = totalPrice + shippingCost
  const formatShipping = shippingCost === 0 ? "Gratis" : formatPrice(shippingCost)
  let shippingMessage = getShippingMessage(totalPrice)

  const handlePayment = async () => {
    if (!selectedMethod || !checkoutData) return

    setIsProcessing(true)

    // Simular procesamiento
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber,
          cliente: checkoutData,
          productos: items,
          total: totalWithShipping,
          estado: "Pendiente",
          metodoPago: paymentMethods.find((m) => m.id === selectedMethod)?.name || "",
          createdAt: new Date(),
        }),
      })

      const data = await response.json()

      if (!data.success) {
        console.error("Error guardando orden:", data.error)
        setIsProcessing(false)
        return
      }

      clearCart()
      localStorage.removeItem("antojitosquin-checkout")
      localStorage.setItem("antojitosquin-last-order", orderNumber)

      router.push("/confirmation")
    } catch (error) {
      console.error(error)
      setIsProcessing(false)
    }
  }

  if (items.length === 0 || !checkoutData) return null

  return (
    <div className="min-h-screen bg-background">
      <StoreHeader />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/checkout" className="p-2 rounded-full hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Método de Pago</h1>
        </div>

        {/* Métodos de pago */}
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <h2 className="font-bold text-foreground mb-4">Selecciona un método de pago</h2>
          <div className="space-y-3">
            {paymentMethods.map((method) => {
              const Icon = method.icon
              return (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-xl border transition-all",
                    selectedMethod === method.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center",
                      selectedMethod === method.id ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="font-medium text-foreground">{method.name}</span>
                  <div
                    className={cn(
                      "ml-auto w-5 h-5 rounded-full border-2 transition-all",
                      selectedMethod === method.id ? "border-primary bg-primary" : "border-border"
                    )}
                  >
                    {selectedMethod === method.id && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Resumen */}
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <h2 className="font-bold text-foreground mb-3">Resumen</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Cliente</span>
              <span className="text-foreground">{checkoutData.nombre}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Dirección</span>
              <span className="text-foreground max-w-[60%] text-right">{checkoutData.direccion}</span>
            </div>
          </div>

          <hr className="border-border my-4" />

          <div className="flex justify-between text-muted-foreground mb-1">
            <span>Envío</span>
            <span className="text-accent font-medium">{formatShipping}</span>
          </div>
          {shippingMessage && <p className="text-sm font-semibold mt-1 text-green-600">{shippingMessage}</p>}

          <div className="flex justify-between font-bold text-lg text-foreground mt-3">
            <span>Total a pagar</span>
            <span className="text-primary">{formatPrice(totalWithShipping)}</span>
          </div>
        </div>

        <button
          onClick={handlePayment}
          disabled={!selectedMethod || isProcessing}
          className={cn(
            "w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2",
            selectedMethod && !isProcessing
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Procesando...
            </>
          ) : (
            "Confirmar Pedido"
          )}
        </button>
      </main>
    </div>
  )
}
