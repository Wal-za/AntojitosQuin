"use client"

import type React from "react"
import Link from "next/link"
import { ShoppingCart, Search, Menu, X, ChevronDown, Store } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useProducts } from "@/context/products-context"

export function StoreHeader() {
  const { totalItems, cartAnimating } = useCart()
  const { categories } = useProducts()
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [selectedCategoryName, setSelectedCategoryName] = useState("Todas las Categorías")
  const categoryRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Función para normalizar texto (minúsculas, sin acentos)
  const normalizeText = (text: string) => {
    return text
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
  }

  // Función para capitalizar la primera letra de cada palabra
  const capitalizeWords = (text: string) => {
  return text
    .split(" ")
    .map(word => {
      if (word.length === 0) return ""
      const firstLetter = word[0].toLocaleUpperCase() // usa la configuración local para mayúsculas
      const rest = word.slice(1)
      return firstLetter + rest
    })
    .join(" ")
}


  // Map para eliminar duplicados ignorando mayúsculas/minúsculas
  const normalizedCategoriesMap = new Map<string, { id: string; name: string }>()
  categories.forEach((cat) => {
    const normalizedId = normalizeText(cat)
    if (!normalizedCategoriesMap.has(normalizedId)) {
      normalizedCategoriesMap.set(normalizedId, { id: normalizedId, name: cat })
    }
  })

  const categoryList = [
    { id: "all", name: "Todas las Categorías" },
    ...Array.from(normalizedCategoriesMap.values())
  ]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setCategoryOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      const query = encodeURIComponent(normalizeText(searchQuery))
      router.push(`/?search=${query}`)
    }
  }

  const handleCategorySelect = (category: { id: string; name: string }) => {
    setSelectedCategoryName(category.name)
    setCategoryOpen(false)
    setMobileMenuOpen(false)
    if (category.id === "all") {
      setSelectedCategoryName("Todas las Categorías")
      router.push("/")
    } else {
      const query = encodeURIComponent(normalizeText(category.name))
      router.push(`/?category=${query}`)
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-card shadow-lg border-b border-border">
      {/* Top Info Bar */}
      <div className="bg-primary text-primary-foreground text-xs py-1.5">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <span className="hidden sm:block">Envíos a todo el país | Pagos seguros</span>
          <span className="sm:hidden">Envíos a todo el país</span>
          <span className="font-medium">Atención: Lun-Sáb 9am-6pm</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
              <Store className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="hidden md:flex flex-col">
              <span className="font-bold text-xl text-foreground leading-tight">AntojitosQuin</span>
              <span className="text-[10px] text-muted-foreground -mt-0.5">Tu tienda virtual</span>
            </div>
          </Link>

          {/* Desktop Category Dropdown */}
          <div ref={categoryRef} className="hidden lg:block relative">
            <button
              onClick={() => setCategoryOpen(!categoryOpen)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-background hover:bg-muted transition-all",
                categoryOpen && "ring-2 ring-primary/30"
              )}
            >
              <span className="font-medium text-sm text-foreground">{capitalizeWords(selectedCategoryName)}</span>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform",
                  categoryOpen && "rotate-180"
                )}
              />
            </button>

            {categoryOpen && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-card rounded-xl shadow-xl border border-border overflow-y-auto max-h-64 animate-in fade-in slide-in-from-top-2 duration-200">
                {categoryList.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category)}
                    className={cn(
                      "w-full flex items-center px-4 py-3 text-left hover:bg-muted transition-colors",
                      selectedCategoryName === category.name && "bg-primary/10 text-primary"
                    )}
                  >
                    <span className="font-medium text-sm">{capitalizeWords(category.name)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="¿Qué estás buscando hoy?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 pl-11 pr-4 rounded-full border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Buscar
              </button>
            </div>
          </form>

          {/* Mobile Search Bar */}
          <form onSubmit={handleSearch} className="flex md:hidden flex-1 relative">
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 pl-10 pr-4 rounded-full border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </form>

          {/* Cart & Mobile Menu */}
          <div className="flex items-center gap-2">
            <Link
              href="/cart"
              className={cn(
                "relative flex items-center gap-2 px-3 py-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors",
                cartAnimating && "animate-bounce-small"
              )}
            >
              <ShoppingCart className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary hidden sm:block">Carrito</span>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full hover:bg-muted transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Category Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute left-0 right-0 top-full bg-card border-b border-border shadow-lg animate-in slide-in-from-top-2 duration-200 z-50 max-h-64 overflow-y-auto">
            <nav className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              {categoryList.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category)}
                  className={cn(
                    "w-full flex items-center px-4 py-3 rounded-lg hover:bg-muted transition-colors",
                    selectedCategoryName === category.name && "bg-primary/10 text-primary"
                  )}
                >
                  <span className="font-medium">{capitalizeWords(category.name)}</span>
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
