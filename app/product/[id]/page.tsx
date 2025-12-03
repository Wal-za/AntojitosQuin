"use client"

import { use } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Minus, Plus, ShoppingCart, Heart } from "lucide-react"
import { useState, useEffect } from "react"
import { StoreHeader } from "@/components/store-header"
import { ProductCard } from "@/components/product-card"
import { ScrollToTop } from "@/components/scroll-to-top"
import { useProducts } from "@/context/products-context"
import { useCart } from "@/context/cart-context"
import { cn } from "@/lib/utils"

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { getProductById, getProductsByCategory } = useProducts()
  const { addToCart } = useCart()
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const product = getProductById(Number(id))

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background">
        <StoreHeader />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <StoreHeader />
        <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
          <h1 className="text-2xl font-bold text-foreground mb-2">Producto no encontrado</h1>
          <p className="text-muted-foreground mb-4">El producto que buscas no existe.</p>
          <Link href="/" className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium">
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  const discount = Math.round(((product.precioOriginal - product.precioFinal) / product.precioOriginal) * 100)

  const similarProducts = getProductsByCategory(product.categoria)
    .filter((p) => p.id !== product.id)
    .slice(0, 4)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleAddToCart = () => {
    setIsAdding(true)
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        nombre: product.nombre,
        precioCompra: product.precioCompra,
        precioFinal: product.precioFinal,
        precioOriginal: product.precioOriginal,
        imagen: product.imagen,
      })
    }
    setTimeout(() => setIsAdding(false), 300)
  }

  return (
    <div className="min-h-screen bg-background">
      <StoreHeader />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
      </div>

      {/* Product Detail */}
      <main className="max-w-7xl mx-auto px-4 pb-12">
        <div className="grid md:grid-cols-2 gap-8 animate-slide-up">
          {/* Image */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-card shadow-md">
            <Image
              src={product.imagen || "/placeholder.svg"}
              alt={product.nombre}
              fill
              className="object-cover"
              priority
            />
            {discount > 0 && (
              <div className="absolute top-4 left-4 bg-destructive text-destructive-foreground px-3 py-1.5 rounded-lg text-sm font-bold">
                -{discount}% OFF
              </div>
            )}
            {product.etiqueta && (
              <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-semibold">
                {product.etiqueta}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <span className="text-sm text-primary font-medium mb-2">{product.categoria}</span>
            <h1 className="text-3xl font-bold text-foreground mb-4">{product.nombre}</h1>

            {/* Pricing */}
            <div className="flex items-end gap-3 mb-4">
              <span className="text-4xl font-bold text-primary">{formatPrice(product.precioFinal)}</span>
              {product.precioOriginal > product.precioFinal && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(product.precioOriginal)}
                  </span>
                  <span className="text-sm bg-lime-light text-foreground px-2 py-0.5 rounded font-medium">
                    Ahorras {formatPrice(product.precioOriginal - product.precioFinal)}
                  </span>
                </>
              )}
            </div>

            <p className="text-muted-foreground leading-relaxed mb-6">{product.descripcion}</p>

            {/* Stock */}
            <div className="mb-6">
              <span
                className={cn(
                  "text-sm font-medium px-2 py-1 rounded",
                  product.stock > 10
                    ? "bg-accent/20 text-accent-foreground"
                    : product.stock > 0
                      ? "bg-yellow/30 text-foreground"
                      : "bg-destructive/20 text-destructive",
                )}
              >
                {product.stock > 10
                  ? `En stock (${product.stock} disponibles)`
                  : product.stock > 0
                    ? `¡Solo quedan ${product.stock}!`
                    : "Agotado"}
              </span>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-foreground font-medium">Cantidad:</span>
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-muted transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="px-4 py-2 font-medium min-w-[50px] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-2 hover:bg-muted transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={cn(
                  "flex-1 py-3 rounded-xl font-semibold text-lg",
                  "flex items-center justify-center gap-2",
                  "bg-primary text-primary-foreground",
                  "hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed",
                  "transition-all active:scale-[0.98]",
                  isAdding && "animate-pulse-glow",
                )}
              >
                <ShoppingCart className="w-5 h-5" />
                Agregar al carrito
              </button>
              <button className="p-3 rounded-xl border border-border hover:bg-muted transition-colors">
                <Heart className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">Productos Similares</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {similarProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      <ScrollToTop />
    </div>
  )
}
