"use client"

import { useProducts } from "@/context/products-context"
//import { ProductCard } from "./product-card"
import { OfferCard } from "./OfferCard"

import { Sparkles } from "lucide-react"

export function OffersSection() {
  const { getOffersOfTheDay } = useProducts()
  const offers = getOffersOfTheDay()

  if (offers.length === 0) return null

  return (
    <section className="py-8">
      <div className="flex items-center gap-2 mb-6 px-4">
        <Sparkles className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Ofertas</h2>
        <span className="ml-2 px-2 py-0.5 bg-destructive/10 text-destructive text-sm font-medium rounded-full">
          Hasta 30% OFF
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
        {offers.map((product) => (
          <OfferCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
