"use client"

import { useProducts } from "@/context/products-context"
import { cn } from "@/lib/utils"

interface CategoryMenuProps {
  selectedCategory: string | null
  onSelectCategory: (category: string | null) => void
}

export function CategoryMenu({ selectedCategory, onSelectCategory }: CategoryMenuProps) {
  const { categories } = useProducts()

  return (
    <div className="w-full overflow-x-auto scrollbar-hide py-4">
      <div className="flex gap-2 px-4 min-w-max">
        <button
          onClick={() => onSelectCategory(null)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
            selectedCategory === null
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-card border border-border hover:bg-muted text-foreground",
          )}
        >
          Todos
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
              selectedCategory === category
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-card border border-border hover:bg-muted text-foreground",
            )}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  )
}
