"use client"

import type React from "react"

import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Plus } from "lucide-react"
import { useCart } from "@/context/cart-context"
import type { Product } from "@/context/products-context"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()
  const [isAdding, setIsAdding] = useState(false)

  const discount = Math.round(
    ((product.precioOriginal - product.precioFinal) / product.precioOriginal) * 100
  )

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsAdding(true)
    addToCart({
      id: product.id,
      nombre: product.nombre,
      precioCompra: product.precioCompra,
      precioFinal: product.precioFinal,
      precioOriginal: product.precioOriginal,
      imagen: product.imagenes[0] || "/placeholder.svg",
    })
    setTimeout(() => setIsAdding(false), 300)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getEtiquetaStyle = (etiqueta: string) => {
    switch (etiqueta) {
      case "Nuevo":
        return "bg-accent text-accent-foreground"
      case "Más vendido":
        return "bg-primary text-primary-foreground"
      case "Popular":
        return "bg-[var(--pink)] text-foreground"
      case "Recomendado":
        return "bg-secondary text-secondary-foreground"
      default:
        return "bg-muted text-foreground"
    }
  }

  return (
    <Link href={`/product/${product.id}`} className="h-full">
      <article className="group bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-border hover:border-primary/30 animate-slide-up flex flex-col h-full">

        {/* Imagen */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={product.imagenes[0] || "/placeholder.svg"}
            alt={product.nombre}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Badge de descuento (más pequeño y más al borde) */}
          {discount > 0 && (
            <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded-md text-[11px] font-semibold shadow-sm">
              -{discount}%
            </div>
          )}

          {/* Badge de etiqueta (más pequeño y ajustado) */}
          {product.etiqueta && (
            <div
              className={cn(
                "absolute top-2 right-2 px-1.5 py-0.5 rounded-md text-[11px] font-semibold shadow-sm",
                getEtiquetaStyle(product.etiqueta)
              )}
            >
              {product.etiqueta}
            </div>
          )}
          
        </div>

        {/* Contenido */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {product.nombre}
          </h3>

          <p className="text-sm text-muted-foreground line-clamp-3 mb-3 flex-1">
            {product.descripcion}
          </p>

          {/* Precios */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-1 sm:gap-2 mb-3">
            <span className="text-xl font-bold text-primary">
              {formatPrice(product.precioFinal)}
            </span>

            {product.precioOriginal > product.precioFinal && (
              <span className="text-sm text-muted-foreground line-through sm:ml-1">
                {formatPrice(product.precioOriginal)}
              </span>
            )}
          </div>

          {/* Botón agregar 
          <button
            onClick={handleAddToCart}
            className={cn(
              "w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium",
              "flex items-center justify-center gap-2",
              "hover:bg-primary/90 active:scale-[0.98] transition-all",
              isAdding && "animate-pulse-glow"
            )}
          >
            <ShoppingCart className="w-4 h-4" />
            Agregar
          </button>
          */}
        </div>
      </article>
    </Link>
  )
}
