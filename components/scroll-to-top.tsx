"use client"

import { ChevronUp } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const toggleVisible = () => {
      setVisible(window.scrollY > 300)
    }
    window.addEventListener("scroll", toggleVisible)
    return () => window.removeEventListener("scroll", toggleVisible)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        "fixed bottom-6 right-6 p-3 rounded-full bg-primary text-primary-foreground shadow-lg",
        "hover:bg-primary/90 transition-all duration-300 z-40",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none",
      )}
      aria-label="Volver arriba"
    >
      <ChevronUp className="w-6 h-6" />
    </button>
  )
}
