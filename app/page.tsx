"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { StoreHeader } from "@/components/store-header"
import { StoreFooter } from "@/components/store-footer"
import { ProductCard } from "@/components/product-card"
import { OffersSection } from "@/components/offers-section"
import { ScrollToTop } from "@/components/scroll-to-top"
import { useProducts } from "@/context/products-context"
import { SearchX, Loader2 } from "lucide-react"

export default function HomePage() {
  const { products, searchProducts, getProductsByCategory, loading, error } = useProducts()
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get("search")
  const categoryParam = searchParams.get("category")

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [filteredProducts, setFilteredProducts] = useState(products)

  // --- PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 20

  // --- Productos destacados ---
  const newProducts = products.filter((p) => p.etiqueta?.includes("nuevo11"))
  const popularProducts = products.filter((p) => p.etiqueta?.includes("popular11"))

  // --- Sincronización URL -> selectedCategory ---
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(decodeURIComponent(categoryParam))
    } else {
      setSelectedCategory(null)
    }
  }, [categoryParam])

  // --- Filtrado de productos ---
  useEffect(() => {
    setCurrentPage(1) // Reinicia la página al cambiar búsqueda o categoría

    if (searchQuery) {
      setFilteredProducts(searchProducts(searchQuery))
      setSelectedCategory(null)
    } else if (selectedCategory) {
      setFilteredProducts(getProductsByCategory(selectedCategory))
    } else {
      setFilteredProducts(products)
    }
  }, [searchQuery, selectedCategory, products, searchProducts, getProductsByCategory])

  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct)
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }

  function capitalizeFirstLetter(str: string | null) {
    if (!str) return ""
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <StoreHeader />

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Bienvenido a <span className="text-primary">AntojitosQuin</span>
          </h1>
          <p className="text-muted-foreground text-lg">Los mejores productos al mejor precio</p>
        </div>
      </section>

      {/* Productos Destacados */}
      {newProducts.length > 0 && (
        <section className="py-6 px-4 max-w-7xl mx-auto">
          <h2 className="text-xl font-bold text-foreground mb-4">¡Nuevos Productos!</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {newProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {popularProducts.length > 0 && (
        <section className="py-6 px-4 max-w-7xl mx-auto">
          <h2 className="text-xl font-bold text-foreground mb-4">Populares</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {popularProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Search Results Info */}
      {searchQuery && (
        <div className="px-4 py-2 max-w-7xl mx-auto">
          <p className="text-muted-foreground">
            Resultados para: <span className="font-medium text-foreground">{`"${searchQuery}"`}</span> (
            {filteredProducts.length} productos)
          </p>
        </div>
      )}

      {/* Offers Section */}
      {!searchQuery && !selectedCategory && !categoryParam && !loading && <OffersSection />}

      {/* Productos principales */}
      <section className="py-8 px-4 flex-1">
        <div className="max-w-7xl mx-auto">
          {!searchQuery && (
            <h2 className="text-2xl font-bold text-foreground mb-6">
              {capitalizeFirstLetter(categoryParam) || capitalizeFirstLetter(selectedCategory) || "Todos los Productos"}
            </h2>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">Cargando productos...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <SearchX className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Error al cargar productos</h3>
              <p className="text-muted-foreground">{error}</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {currentProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* --- PAGINACIÓN --- */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-6 gap-4">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={`w-10 h-10 flex items-center justify-center rounded-full shadow transition-colors
        ${currentPage === 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-800 hover:bg-primary hover:text-white'}`}
                  >
                    &#8592;
                  </button>

                  <span className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-white font-bold shadow">
                    {currentPage}
                  </span>

                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`w-10 h-10 flex items-center justify-center rounded-full shadow transition-colors
        ${currentPage === totalPages
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-800 hover:bg-primary hover:text-white'}`}
                  >
                    &#8594;
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <SearchX className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No se encontraron productos</h3>
              <p className="text-muted-foreground">No hay productos que coincidan con tu búsqueda.</p>
            </div>
          )}
        </div>
      </section>

      <ScrollToTop />
      <StoreFooter />
    </div>
  )
}
