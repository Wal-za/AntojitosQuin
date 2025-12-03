"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import { AdminLayout } from "@/components/admin/admin-layout"
import { useProducts, type Product } from "@/context/products-context"
import { Plus, Pencil, Trash2, X, Search, Loader2, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProductFormData {
  nombre: string
  categoria: string
  precioCompra: number | null
  precioOriginal: number | null
  precioFinal: number | null
  descripcion: string
  imagen: string
  etiqueta: string
  stock: number | null
}

const emptyForm: ProductFormData = {
  nombre: "",
  categoria: "",
  precioCompra: null,
  precioOriginal: null,
  precioFinal: null,
  descripcion: "",
  imagen: "",
  etiqueta: "",
  stock: null,
}

const etiquetaOptions = ["", "Nuevo", "Popular", "Más vendido", "Recomendado"]
const PRODUCTS_PER_PAGE = 20

export default function AdminProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct, categories, loading, refreshProducts } = useProducts()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<ProductFormData>(emptyForm)
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  // Paginación con persistencia en localStorage
  const [currentPage, setCurrentPage] = useState(() => {
    if (typeof window !== "undefined") {
      const savedPage = localStorage.getItem("adminProductsPage")
      return savedPage ? Number(savedPage) : 1
    }
    return 1
  })

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    localStorage.setItem("adminProductsPage", newPage.toString())
  }

  const filteredProducts = products.filter(
    (p) =>
      p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.categoria.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE,
  )

  const formatPrice = (price: number | null) => {
    if (price === null) return "-"
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        nombre: product.nombre,
        categoria: product.categoria,
        precioCompra: product.precioCompra,
        precioOriginal: product.precioOriginal,
        precioFinal: product.precioOriginal === product.precioFinal ? 0 : product.precioFinal,
        descripcion: product.descripcion,
        imagen: product.imagen,
        etiqueta: product.etiqueta || "",
        stock: product.stock,
      })
    } else {
      setEditingProduct(null)
      setFormData(emptyForm)
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingProduct(null)
    setFormData(emptyForm)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const productData = {
        ...formData,
        precioCompra: formData.precioCompra ?? 0,
        precioOriginal: formData.precioOriginal ?? 0,
        precioFinal: formData.precioFinal ?? 0,
        stock: formData.stock ?? 0,
        etiqueta: formData.etiqueta || null,
      }

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData)
      } else {
        await addProduct(productData)
      }
      closeModal()
    } catch (error) {
      console.error("Error saving product:", error)
      alert("Error al guardar el producto")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteProduct(id)
      setDeleteConfirm(null)
    } catch (error) {
      console.error("Error deleting product:", error)
      alert("Error al eliminar el producto")
    }
  }

  const calculateDiscount = () => {
    if (formData.precioOriginal && formData.precioFinal) {
      return Math.round(((formData.precioOriginal - formData.precioFinal) / formData.precioOriginal) * 100)
    }
    return 0
  }

  const calculateProfit = () => {
    if (formData.precioFinal != 0) {
      if (formData.precioFinal !== null && formData.precioCompra !== null) {
        return formData.precioFinal - formData.precioCompra
      }
    } else {
      if (formData.precioOriginal !== null && formData.precioCompra !== null) {
        return formData.precioOriginal - formData.precioCompra
      }
    }
    return null
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Productos</h1>
            <p className="text-muted-foreground">{products.length} productos en total</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refreshProducts()}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg font-medium hover:bg-muted transition-colors disabled:opacity-50"
            >
              <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
              Actualizar
            </button>
            <button
              onClick={() => openModal()}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Agregar Producto
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              handlePageChange(1)
            }}
            className="w-full px-4 py-2 pl-10 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Tabla */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="ml-2 text-muted-foreground">Cargando productos...</span>
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr className="text-left text-sm text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Producto</th>
                    <th className="px-4 py-3 font-medium">Categoría</th>
                    <th className="px-4 py-3 font-medium">Precio</th>
                    <th className="px-4 py-3 font-medium">Descuento</th>
                    <th className="px-4 py-3 font-medium">Stock</th>
                    <th className="px-4 py-3 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.map((product) => {
                    const discount = Math.round(
                      ((product.precioOriginal - product.precioFinal) / product.precioOriginal) * 100,
                    )
                    return (
                      <tr key={product.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                              <Image
                                src={product.imagen || "/placeholder.svg"}
                                alt={product.nombre}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-foreground truncate max-w-[200px]">{product.nombre}</p>
                              {product.etiqueta && (
                                <span className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded">
                                  {product.etiqueta}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">{product.categoria}</td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-foreground">{formatPrice(product.precioFinal)}</p>
                            {product.precioOriginal > product.precioFinal && (
                              <p className="text-xs text-muted-foreground line-through">
                                {formatPrice(product.precioOriginal)}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {discount > 0 ? (
                            <span
                              className={cn(
                                "px-2 py-1 rounded text-xs font-bold",
                                discount >= 25
                                  ? "bg-destructive/10 text-destructive"
                                  : "bg-accent/10 text-accent-foreground",
                              )}
                            >
                              -{discount}%
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "text-sm font-medium",
                              product.stock < 10 ? "text-destructive" : "text-foreground",
                            )}
                          >
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openModal(product)}
                              className="p-2 rounded-lg hover:bg-muted transition-colors"
                            >
                              <Pencil className="w-4 h-4 text-muted-foreground" />
                            </button>
                            {deleteConfirm === product.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleDelete(product.id)}
                                  className="px-2 py-1 bg-destructive text-destructive-foreground rounded text-xs font-medium"
                                >
                                  Confirmar
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  className="px-2 py-1 bg-muted rounded text-xs"
                                >
                                  Cancelar
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirm(product.id)}
                                className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <div className="flex justify-center items-center gap-2 py-3">
              <button
                onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded hover:bg-muted disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1">
                Página {currentPage} de {totalPages || 1}
              </span>
              <button
                onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 py-1 border rounded hover:bg-muted disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card">
                <h2 className="text-lg font-bold text-foreground">
                  {editingProduct ? "Editar Producto" : "Nuevo Producto"}
                </h2>
                <button onClick={closeModal} className="p-2 rounded-lg hover:bg-muted transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                {/* ...El resto del formulario queda igual */}
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
