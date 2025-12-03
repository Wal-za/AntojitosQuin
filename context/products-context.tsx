"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

export interface Product {
  id: number
  nombre: string
  categoria: string
  precioCompra: number
  precioOriginal: number
  precioFinal: number
  descripcion: string
  imagen: string
  etiqueta: string | null
  stock: number
}

interface ProductsContextType {
  products: Product[]
  categories: string[]
  loading: boolean
  error: string | null
  getProductById: (id: number) => Product | undefined
  getProductsByCategory: (category: string) => Product[]
  searchProducts: (query: string) => Product[]
  getOffersOfTheDay: () => Product[]
  addProduct: (product: Omit<Product, "id">) => Promise<void>
  updateProduct: (id: number, updates: Partial<Product>) => Promise<void>
  deleteProduct: (id: number) => Promise<void>
  refreshProducts: () => Promise<void>
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined)

// ⭐ Normalizador para evitar problemas de mayúsculas, minúsculas y tildes
const normalize = (text: string) =>
  text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/products")

      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }

      const data = await response.json()
      setProducts(data)

      const uniqueCategories = [...new Set(data.map((p: Product) => p.categoria))] as string[]
      setCategories(uniqueCategories)
    } catch (err) {
      console.error("Error fetching products:", err)
      setError("Error al cargar los productos")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const getProductById = (id: number) => products.find((p) => p.id === id)

  // ⭐ Aquí va la versión mejorada que ignora mayúsculas/minúsculas y tildes
  const getProductsByCategory = (category: string) => {
    const normalizedCategory = normalize(category)
    return products.filter((p) => normalize(p.categoria) === normalizedCategory)
  }

  // Función para normalizar texto: minúsculas, sin tildes, sin espacios extras
  const normalizeText = (text: string) =>
    text
      .normalize("NFD")                 
      .replace(/[\u0300-\u036f]/g, "") 
      .toLowerCase()
      .trim();

  const searchProducts = (query: string) => {
    const normalizedQuery = normalizeText(query);

    // Coincidencias exactas
    const exactMatches = products.filter(p =>
      [p.nombre, p.categoria, p.descripcion]
        .some(field => normalizeText(field) === normalizedQuery)
    );

    // Coincidencias parciales (solo los que no fueron exactos)
    const partialMatches = products.filter(p => {
      if (exactMatches.includes(p)) return false;

      return [p.nombre, p.categoria, p.descripcion]
        .some(field => normalizeText(field).includes(normalizedQuery));
    });

    // Unir resultados exactos y parciales
    return [...exactMatches, ...partialMatches];
  };



  const getOffersOfTheDay = () => {
    return products
      .map((p) => ({
        ...p,
        discount: Math.round(((p.precioOriginal - p.precioFinal) / p.precioOriginal) * 100),
      }))
      .sort((a, b) => b.discount - a.discount)
      .slice(0, 4)
  }

  const addProduct = async (product: Omit<Product, "id">) => {
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      })

      if (!response.ok) {
        throw new Error("Failed to add product")
      }

      await fetchProducts()
    } catch (err) {
      console.error("Error adding product:", err)
      throw err
    }
  }

  const updateProduct = async (id: number, updates: Partial<Product>) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error("Failed to update product")
      }

      await fetchProducts()
    } catch (err) {
      console.error("Error updating product:", err)
      throw err
    }
  }

  const deleteProduct = async (id: number) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete product")
      }

      await fetchProducts()
    } catch (err) {
      console.error("Error deleting product:", err)
      throw err
    }
  }

  return (
    <ProductsContext.Provider
      value={{
        products,
        categories,
        loading,
        error,
        getProductById,
        getProductsByCategory,
        searchProducts,
        getOffersOfTheDay,
        addProduct,
        updateProduct,
        deleteProduct,
        refreshProducts: fetchProducts,
      }}
    >
      {children}
    </ProductsContext.Provider>
  )
}

export function useProducts() {
  const context = useContext(ProductsContext)
  if (!context) {
    throw new Error("useProducts must be used within a ProductsProvider")
  }
  return context
}
