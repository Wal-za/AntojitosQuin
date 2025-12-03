"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, User, MapPin, Phone, Mail, Check } from "lucide-react"
import { StoreHeader } from "@/components/store-header"
import { useCart } from "@/context/cart-context"
import { cn } from "@/lib/utils"

interface FormData {
  nombre: string
  direccion: string
  telefono: string
  correo: string
}

interface FormErrors {
  nombre?: string
  direccion?: string
  telefono?: string
  correo?: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice } = useCart()
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    direccion: "",
    telefono: "",
    correo: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  // Redirección si el carrito está vacío
  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart")
    }
  }, [items, router])

  const validateField = (name: keyof FormData, value: string): string | undefined => {
    switch (name) {
      case "nombre":
        return value.trim().length < 3 ? "El nombre debe tener al menos 3 caracteres" : undefined
      case "direccion":
        return value.trim().length < 10 ? "Ingresa una dirección válida" : undefined
      case "telefono":
        return !/^\d{10}$/.test(value.replace(/\D/g, "")) ? "Ingresa un teléfono válido (10 dígitos)" : undefined
      case "correo":
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "Ingresa un correo válido" : undefined
      default:
        return undefined
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (touched[name]) {
      const error = validateField(name as keyof FormData, value)
      setErrors((prev) => ({ ...prev, [name]: error }))
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    const error = validateField(name as keyof FormData, value)
    setErrors((prev) => ({ ...prev, [name]: error }))
  }

  const isFormValid = () => {
    const newErrors: FormErrors = {}
    let isValid = true

    Object.keys(formData).forEach((key) => {
      const error = validateField(key as keyof FormData, formData[key as keyof FormData])
      if (error) {
        newErrors[key as keyof FormErrors] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isFormValid()) {
      localStorage.setItem("antojitosquin-checkout", JSON.stringify(formData))
      router.push("/payment")
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  // Mientras router hace push si el carrito está vacío, renderizamos null
  if (items.length === 0) {
    return null
  }

  const inputClasses = (fieldName: keyof FormData) =>
    cn(
      "w-full px-4 py-3 pl-12 rounded-xl border bg-background transition-all",
      errors[fieldName] && touched[fieldName]
        ? "border-destructive focus:ring-destructive/50"
        : !errors[fieldName] && touched[fieldName] && formData[fieldName]
        ? "border-accent focus:ring-accent/50"
        : "border-border focus:ring-primary/50",
      "focus:outline-none focus:ring-2",
    )

  return (
    <div className="min-h-screen bg-background">
      <StoreHeader />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/cart" className="p-2 rounded-full hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Datos de Envío</h1>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
              1
            </div>
            <span className="ml-2 text-sm font-medium text-foreground">Datos</span>
          </div>
          <div className="w-12 h-0.5 bg-border mx-2"></div>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold text-sm">
              2
            </div>
            <span className="ml-2 text-sm font-medium text-muted-foreground">Pago</span>
          </div>
          <div className="w-12 h-0.5 bg-border mx-2"></div>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold text-sm">
              3
            </div>
            <span className="ml-2 text-sm font-medium text-muted-foreground">Confirmación</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6 space-y-5">
            {/* Nombre */}
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-foreground mb-2">
                Nombre completo
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Juan Pérez"
                  className={inputClasses("nombre")}
                />
                {!errors.nombre && touched.nombre && formData.nombre && (
                  <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />
                )}
              </div>
              {errors.nombre && touched.nombre && <p className="mt-1 text-sm text-destructive">{errors.nombre}</p>}
            </div>

            {/* Dirección */}
            <div>
              <label htmlFor="direccion" className="block text-sm font-medium text-foreground mb-2">
                Dirección de entrega
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Calle 123 #45-67, Barrio, Ciudad"
                  className={inputClasses("direccion")}
                />
                {!errors.direccion && touched.direccion && formData.direccion && (
                  <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />
                )}
              </div>
              {errors.direccion && touched.direccion && (
                <p className="mt-1 text-sm text-destructive">{errors.direccion}</p>
              )}
            </div>

            {/* Teléfono */}
            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-foreground mb-2">
                Teléfono
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="3001234567"
                  className={inputClasses("telefono")}
                />
                {!errors.telefono && touched.telefono && formData.telefono && (
                  <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />
                )}
              </div>
              {errors.telefono && touched.telefono && (
                <p className="mt-1 text-sm text-destructive">{errors.telefono}</p>
              )}
            </div>

            {/* Correo */}
            <div>
              <label htmlFor="correo" className="block text-sm font-medium text-foreground mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  id="correo"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="juan@ejemplo.com"
                  className={inputClasses("correo")}
                />
                {!errors.correo && touched.correo && formData.correo && (
                  <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />
                )}
              </div>
              {errors.correo && touched.correo && <p className="mt-1 text-sm text-destructive">{errors.correo}</p>}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-bold text-foreground mb-3">Resumen del pedido</h2>
            <div className="flex justify-between text-muted-foreground mb-2">
              <span>{items.length} productos</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground mb-3">
              <span>Envío</span>
              <span className="text-accent font-medium">Gratis</span>
            </div>
            <hr className="border-border mb-3" />
            <div className="flex justify-between font-bold text-lg text-foreground">
              <span>Total</span>
              <span className="text-primary">{formatPrice(totalPrice)}</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90 transition-colors"
          >
            Continuar al Pago
          </button>
        </form>
      </main>
    </div>
  )
}
