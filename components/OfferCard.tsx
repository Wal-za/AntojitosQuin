"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Plus } from "lucide-react"
import { useCart } from "@/context/cart-context"
import type { Product } from "@/context/products-context"
import { cn } from "@/lib/utils"

interface OfferCardProps {
    product: Product
}

export function OfferCard({ product }: OfferCardProps) {
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
            imagen: product.imagenes[0] || null,
        })
        setTimeout(() => setIsAdding(false), 300)
    }

    const formatPrice = (price: number) =>
        new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(price)

    const getEtiquetaStyle = (etiqueta: string) => {
        switch (etiqueta) {
            case "Nuevo":
                return "bg-yellow-400 text-black"
            case "Más vendido":
                return "bg-orange-400 text-white"
            case "Popular":
                return "bg-pink-400 text-white"
            case "Recomendado":
                return "bg-red-400 text-white"
            default:
                return "bg-gray-200 text-gray-800"
        }
    }

    return (
        <Link href={`/product/${product.id}`} className="h-full">
            <article className="group relative flex flex-col bg-gradient-to-b from-orange-100 via-orange-50 to-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-orange-200 h-full">

                {/* Imagen */}
                <div className="relative aspect-square overflow-hidden bg-muted">
                    <Image
                        src={product.imagenes[0] || "/placeholder.svg"}
                        alt={product.nombre}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Badge de descuento (reducido y más hacia el borde) */}
                    {discount > 0 && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white font-semibold text-[10px] px-1.5 py-0.5 rounded-md shadow-md">
                            -{discount}%
                        </div>
                    )}

                    {/* Etiqueta del producto (texto más pequeño y mejor posición) */}
                    {product.etiqueta && (
                        <div className={cn(
                            "absolute top-2 right-2 px-1.5 py-0.5 rounded-full text-[10px] font-semibold shadow-sm",
                            getEtiquetaStyle(product.etiqueta)
                        )}>
                            {product.etiqueta}
                        </div>
                    )}

                    {/* Botón agregar rápido */}
                    <button
                        onClick={handleAddToCart}
                        className={cn(
                            "absolute bottom-2 right-2 p-2 rounded-full bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 text-white shadow-lg",
                            "opacity-0 group-hover:opacity-100 transition-all duration-200",
                            "hover:scale-110 active:scale-95",
                            isAdding && "animate-bounce-small"
                        )}
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>

                {/* Contenido */}
                <div className="p-4 flex-1 flex flex-col">

                    <h3 className="font-bold text-lg text-orange-900 group-hover:text-orange-700 transition-colors line-clamp-2">
                        {product.nombre}
                    </h3>

                    <p className="text-sm text-orange-800 line-clamp-3 flex-1 mb-3">
                        {product.descripcion}
                    </p>

                    {/* Precios */}
                    <div className="flex flex-col sm:flex-row sm:items-end gap-1 sm:gap-2 mb-3">
                        <span className="text-xl font-extrabold text-red-600">
                            {formatPrice(product.precioFinal)}
                        </span>

                        {product.precioOriginal > product.precioFinal && (
                            <span className="text-sm text-orange-700 line-through">
                                {formatPrice(product.precioOriginal)}
                            </span>
                        )}
                    </div>

                    {/* Botón agregar grande */}
                    <button
                        onClick={handleAddToCart}
                        className={cn(
                            "w-full py-3 rounded-lg bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 text-white font-bold flex items-center justify-center gap-2 shadow-md hover:brightness-105 active:scale-95 transition-transform",
                            isAdding && "animate-pulse"
                        )}
                    >
                        <ShoppingCart className="w-5 h-5" />
                        ¡Lo quiero!
                    </button>
                </div>
            </article>
        </Link>
    )
}
