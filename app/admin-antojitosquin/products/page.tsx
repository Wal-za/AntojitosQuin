"use client"

import type React from "react"
import { useState } from "react"
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
  precioCompra: 0,
  precioOriginal: 0,
  precioFinal: 0,
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
      p.categoria.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }))
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
          <div className="flex items-center gap-2 flex-wrap">
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

        {/* PRODUCT LIST */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="ml-2 text-muted-foreground">Cargando productos...</span>
          </div>
        ) : (
          <>
            {/* Desktop: Table */}
            <div className="hidden md:block bg-card rounded-xl border border-border overflow-hidden">
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
                        ((product.precioOriginal - product.precioFinal) / product.precioOriginal) * 100
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
                                <p className="text-xs text-muted-foreground line-through">{formatPrice(product.precioOriginal)}</p>
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
                                    : "bg-accent/10 text-accent-foreground"
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
                                product.stock < 10 ? "text-destructive" : "text-foreground"
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

            {/* Mobile: Cards */}
            <div className="md:hidden grid gap-4">
              {paginatedProducts.map((product) => {
                const discount = Math.round(
                  ((product.precioOriginal - product.precioFinal) / product.precioOriginal) * 100
                )

                return (
                  <div key={product.id} className="bg-card border border-border rounded-xl p-4 flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <Image
                          src={product.imagen || "/placeholder.svg"}
                          alt={product.nombre}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-foreground truncate">{product.nombre}</p>
                        {product.etiqueta && (
                          <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">
                            {product.etiqueta}
                          </span>
                        )}
                        <p className="text-sm text-muted-foreground truncate">{product.categoria}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{formatPrice(product.precioFinal)}</span>
                      {discount > 0 && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-accent/10 text-accent-foreground">
                          -{discount}%
                        </span>
                      )}
                    </div>
                    {product.precioOriginal > product.precioFinal && (
                      <span className="text-xs line-through text-muted-foreground">{formatPrice(product.precioOriginal)}</span>
                    )}
                    <p className={`text-sm font-medium ${product.stock < 10 ? "text-destructive" : "text-foreground"}`}>
                      Stock: {product.stock}
                    </p>
                    <div className="flex gap-2 flex-wrap mt-2">
                      <button
                        onClick={() => openModal(product)}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded-lg border hover:bg-muted transition"
                      >
                        <Pencil className="w-4 h-4" /> Editar
                      </button>
                      {deleteConfirm === product.id ? (
                        <>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="flex-1 px-2 py-1 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium"
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="flex-1 px-2 py-1 rounded-lg border text-sm"
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(product.id)}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded-lg border hover:bg-destructive/10 transition"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" /> Eliminar
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Paginación móvil */}
            <div className="md:hidden flex justify-center items-center gap-2 py-3">
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
          </>
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

              <form onSubmit={handleSubmit} className="p-6 space-y-8">

                {/* DATOS PRINCIPALES */}
                <div className="bg-muted/40 p-4 rounded-xl space-y-4 border border-border">
                  <h3 className="font-semibold text-lg">Datos del Producto</h3>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nombre *</label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Categoría *</label>
                    <input
                      type="text"
                      list="categories"
                      name="categoria"
                      value={formData.categoria}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
                      required
                    />
                    <datalist id="categories">
                      {categories.map((cat) => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Descripción *</label>
                    <textarea
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm resize-none"
                      required
                    />
                  </div>
                </div>

                {/* IMAGEN */}
                <div className="bg-muted/40 p-4 rounded-xl border border-border space-y-2">
                  <label className="text-sm font-medium">URL de Imagen *</label>
                  <input
                    type="url"
                    name="imagen"
                    value={formData.imagen}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
                    required
                  />
                </div>

                {/* PRECIOS */}
                <div className="bg-muted/40 p-4 rounded-xl border border-border space-y-4">
                  <h3 className="font-semibold text-lg">Precios</h3>

                  {/* PRECIO DE COMPRA */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Precio de Compra *</label>
                    <input
                      type="number"
                      name="precioCompra"
                      value={formData.precioCompra === 0 || formData.precioCompra === null ? "" : formData.precioCompra}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          precioCompra: value === "" ? null : Number(value),
                        }));
                      }}
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
                      required
                    />
                  </div>

                  {/* PRECIO DE VENTA */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Precio de Venta *</label>
                    <input
                      type="number"
                      name="precioOriginal"
                      value={formData.precioOriginal === 0 || formData.precioOriginal === null ? "" : formData.precioOriginal}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          precioOriginal: value === "" ? null : Number(value),
                        }));
                      }}
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
                      required
                    />
                  </div>

                  {/* PRECIO CON DESCUENTO */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Precio con Descuento *</label>
                    <input
                      type="number"
                      name="precioFinal"
                      value={formData.precioFinal === 0 || formData.precioFinal === null ? "" : formData.precioFinal}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          precioFinal: value === "" ? null : Number(value),
                        }));
                      }}
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
                      
                    />
                  </div>

                  {/* DESCUENTO SIEMPRE VISIBLE */}
                  <div className="p-3 bg-green-100 text-green-800 rounded-lg text-sm border border-green-300">
                    Descuento aplicado: <strong>{Math.max(calculateDiscount(), 0)}%</strong>
                  </div>

                  {/* GANANCIA */}
                  {formData.precioCompra !== null &&
                    formData.precioCompra > 0 &&
                    (formData.precioOriginal !== null && formData.precioOriginal > 0 || formData.precioFinal !== null && formData.precioFinal > 0) && (
                      (() => {
                        const precioFinal = formData.precioFinal ?? formData.precioOriginal ?? 0; // usa 0 si ambos son null
                        const ganancia = precioFinal - formData.precioCompra!;
                        const esPositiva = ganancia >= 0;
                        return (
                          <div className={`p-3 rounded-lg text-sm border ${esPositiva ? "bg-green-50 text-green-700 border-green-300" : "bg-red-50 text-red-700 border-red-300"
                            }`}>
                            Ganancia estimada: <strong>${ganancia.toLocaleString()}</strong>
                          </div>
                        )
                      })()
                    )}


                </div>

                {/* INVENTARIO */}
                <div className="bg-muted/40 p-4 rounded-xl border border-border space-y-4">
                  <h3 className="font-semibold text-lg">Inventario</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Etiqueta</label>
                      <select
                        name="etiqueta"
                        value={formData.etiqueta}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
                      >
                        {etiquetaOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt || "Sin etiqueta"}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Stock *</label>
                      <input
                        type="number"
                        name="stock"
                        min="0"
                        value={formData.stock === 0 || formData.stock === null ? "" : formData.stock}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* BOTONES */}
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={saving}
                    className="flex-1 py-3 rounded-lg border border-border hover:bg-muted transition font-medium"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2 transition font-medium"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingProduct ? "Guardar Cambios" : "Crear Producto"}
                  </button>
                </div>
              </form>


            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
