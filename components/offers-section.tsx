"use client"

import { useState, useEffect } from "react"
import { useProducts } from "@/context/products-context"
import { OfferCard } from "./OfferCard"
import { Sparkles } from "lucide-react"

export function OffersSection() {
  const { products } = useProducts()

  const categoriaSeleccionada = ""
  const Textofertaslanding = "Ofertas en la canasta familiar hasta "
  const Descuento = "80%"


  // Filtrar productos por categoría; si no hay ninguno, mostrar todos
  const filteredProducts = products.filter(
    (p) => p.categoria === categoriaSeleccionada
  )
  const productsToShow =
    filteredProducts.length > 0 ? filteredProducts : products

  // Detectar si hay al menos un producto con descuento
  const hayDescuentos = productsToShow.some(
    (p) => p.precioFinal < p.precioOriginal
  )

  // Ordenación
  const [sortOption, setSortOption] = useState("default")

  const sortedProducts = [...productsToShow].sort((a, b) => {
    switch (sortOption) {
      case "discount":
        const descuentoA = ((a.precioOriginal - a.precioFinal) / a.precioOriginal) * 100
        const descuentoB = ((b.precioOriginal - b.precioFinal) / b.precioOriginal) * 100
        return descuentoB - descuentoA
      case "price":
        return a.precioFinal - b.precioFinal
      case "name":
        return a.nombre.localeCompare(b.nombre)
      default:
        return 0
    }
  })

  // Paginación
  const ITEMS_PER_PAGE = 20
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedProducts = sortedProducts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  )

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [currentPage]);

  if (products.length === 0) return null

  return (
    <section className="py-8 bg-gray-100">
      {/* Título y orden */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4 px-4 justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">
            {filteredProducts.length > 0
              ? `${Textofertaslanding} ${Descuento}`
              : "Ofertas Destacadas"}
          </h2>
        </div>

        {/* Select de orden */}
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <label className="font-medium text-sm sm:text-base">Ordenar por:</label>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 bg-white shadow-sm focus:ring-2 focus:ring-primary focus:border-primary text-sm sm:text-base"
            value={sortOption}
            onChange={(e) => {
              setSortOption(e.target.value)
              setCurrentPage(1)
            }}
          >
            <option value="default">Predeterminado</option>
            {hayDescuentos && <option value="discount">Mayor Descuento</option>}
            <option value="price">Precio</option>
            <option value="name">Nombre</option>
          </select>
        </div>
      </div>

      {/* Productos paginados */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 px-4">
        {paginatedProducts.map((product) => {
          const descuentoPorcentaje =
            ((product.precioOriginal - product.precioFinal) / product.precioOriginal) * 100
          return (
            <div key={product.id} className="relative">
              {descuentoPorcentaje > 0 && (
                <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg z-10">
                  -{Math.round(descuentoPorcentaje)}%
                </span>
              )}
              <OfferCard product={product} />
            </div>
          )
        })}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6 flex-wrap px-4">
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </button>

          <span className="px-3 py-1 border rounded">
            {currentPage} / {totalPages}
          </span>

          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() =>

              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Siguiente
          </button>
        </div>
      )}
    </section>
  )
}
