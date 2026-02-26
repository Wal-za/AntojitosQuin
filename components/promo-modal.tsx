"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Image from "next/image"
import { X, Sparkles, Gift, Crown, Heart, ShoppingBag } from "lucide-react"

const CONFETTI_COLORS = [
  "#f97316", "#fb923c", "#fdba74", "#ea580c",
  "#fbbf24", "#f59e0b", "#fde68a", "#fff7ed",
  "#fecaca", "#fda4af", "#c084fc",
]

const SHAPES = ["circle", "rect", "star"] as const

function ConfettiPiece({
  delay, left, color, size, shape,
}: {
  delay: number; left: number; color: string; size: number; shape: typeof SHAPES[number]
}) {
  const borderRadius = shape === "circle" ? "50%" : shape === "star" ? "2px" : "1px"
  const rotation = shape === "star" ? "rotate(45deg)" : "none"
  return (
    <div
      className="animate-confetti pointer-events-none fixed top-0 z-[60]"
      style={{
        left: `${left}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${2 + Math.random() * 3}s`,
        width: `${size}px`,
        height: shape === "rect" ? `${size * 2.5}px` : `${size}px`,
        backgroundColor: color,
        borderRadius,
        transform: rotation,
      }}
    />
  )
}

function FloatingSparkle({ style }: { style: React.CSSProperties }) {
  return (
    <div
      className="pointer-events-none absolute animate-pulse"
      style={style}
    >
      <Sparkles className="h-3 w-3 text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
    </div>
  )
}

export function PromoModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [step, setStep] = useState(0)

  const confettiPieces = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        id: i,
        delay: Math.random() * 3,
        left: Math.random() * 100,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size: 4 + Math.random() * 10,
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      })),
    []
  )

  const sparkles = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        style: {
          top: `${10 + Math.random() * 80}%`,
          left: `${5 + Math.random() * 90}%`,
          animationDelay: `${Math.random() * 2}s`,
          animationDuration: `${1.5 + Math.random() * 1.5}s`,
        } as React.CSSProperties,
      })),
    []
  )

  useEffect(() => {
    const t1 = setTimeout(() => {
      setIsOpen(true)
      setShowConfetti(true)
    }, 300)
    return () => clearTimeout(t1)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const t1 = setTimeout(() => setStep(1), 200)
    const t2 = setTimeout(() => setStep(2), 500)
    const t3 = setTimeout(() => setStep(3), 800)
    const t4 = setTimeout(() => setStep(4), 1100)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [isOpen])

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 5500)
      return () => clearTimeout(timer)
    }
  }, [showConfetti])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    setShowConfetti(false)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose()
    }
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", onKey)
    }
  }, [isOpen, handleClose])

  if (!isOpen) return null

  return (
    <>
      {showConfetti &&
        confettiPieces.map((p) => <ConfettiPiece key={p.id} {...p} />)}

      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={handleClose}
        role="dialog"
        aria-modal="true"
        aria-label="Promocion de inauguracion - 10% de descuento"
      >
        {/* Animated backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(249,115,22,0.15)_0%,_rgba(0,0,0,0.75)_100%)]" />

        <div
          className="animate-bounce-in relative w-full max-w-[440px] overflow-hidden rounded-[2rem]"
          onClick={(e) => e.stopPropagation()}
          style={{
            boxShadow: "0 0 80px rgba(249,115,22,0.3), 0 25px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(249,115,22,0.15)",
          }}
        >
          {/* Sparkle layer */}
          {sparkles.map((s) => (
            <FloatingSparkle key={s.id} style={s.style} />
          ))}

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white/80 backdrop-blur-md transition-all hover:bg-black/50 hover:text-white hover:scale-110"
            aria-label="Cerrar promocion"
          >
            <X className="h-4 w-4" />
          </button>

          {/* === TOP SECTION: Image + Badge === */}
          <div className="relative">
            {/* Orange top ribbon */}
            <div
              className="relative overflow-hidden bg-gradient-to-r from-[#ea580c] via-[#f97316] to-[#ea580c] px-6 py-2.5"
              style={{
                opacity: step >= 1 ? 1 : 0,
                transform: step >= 1 ? "translateY(0)" : "translateY(-20px)",
                transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.4) 8px, rgba(255,255,255,0.4) 16px)"
              }} />
              <div className="relative flex items-center justify-center gap-2">
                <Crown className="h-4 w-4 text-amber-200" />
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-white">
                  Gran Inauguracion
                </span>
                <Crown className="h-4 w-4 text-amber-200" />
              </div>
            </div>

            {/* Image area */}
            <div className="relative h-52 w-full overflow-hidden">
              <Image
                src="images/promo-beauty.jpg"
                alt="Productos de belleza en promocion"
                fill
                className="object-cover"
                priority
              />
              {/* Gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a0a00] via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-b from-[#f97316]/10 to-transparent" />

              {/* Floating text on image */}
              <div
                className="absolute bottom-4 left-0 right-0 text-center"
                style={{
                  opacity: step >= 2 ? 1 : 0,
                  transform: step >= 2 ? "translateY(0)" : "translateY(30px)",
                  transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                <p className="text-sm font-semibold tracking-wide text-amber-200 drop-shadow-lg">
                  AntojitosQuin
                </p>
              </div>
            </div>

            {/* Giant discount badge */}
            <div
              className="absolute -bottom-12 left-1/2 -translate-x-1/2 z-10"
              style={{
                opacity: step >= 2 ? 1 : 0,
                transform: step >= 2 ? "translate(-50%, 0) scale(1)" : "translate(-50%, 20px) scale(0.5)",
                transition: "all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            >
              <div className="animate-pulse-glow relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#f97316] via-[#fb923c] to-[#ea580c]"
                style={{
                  boxShadow: "0 0 0 4px white, 0 0 0 6px rgba(249,115,22,0.4), 0 8px 30px rgba(249,115,22,0.5)",
                }}
              >
                <div className="absolute inset-2 rounded-full border-2 border-dashed border-white/40 animate-[spin_12s_linear_infinite]" />
                <div className="flex flex-col items-center">
                  <span className="text-[2.2rem] font-extrabold leading-none text-white drop-shadow-md">10%</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-orange-100">OFF</span>
                </div>
              </div>
            </div>
          </div>

          {/* === BOTTOM SECTION: Content === */}
          <div className="relative bg-white px-6 pb-6 pt-16">
            {/* Subtle pattern bg */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: "radial-gradient(circle, #f97316 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }} />

            <div className="relative flex flex-col items-center gap-3">
              {/* Headline */}
              <div
                style={{
                  opacity: step >= 3 ? 1 : 0,
                  transform: step >= 3 ? "translateY(0)" : "translateY(20px)",
                  transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                <h2 className="text-center text-2xl font-bold text-[#1a1a1a] text-balance leading-tight">
                  {"Tu belleza merece lo mejor"}
                </h2>
                <p className="mt-2 text-center text-sm text-[#666] leading-relaxed">
                  Celebra nuestra <span className="font-bold text-[#f97316]">apertura</span> con descuento
                  en <span className="font-bold text-[#ea580c]">todos</span> los productos
                </p>
              </div>

              {/* Category pills */}
              <div
                className="flex flex-wrap items-center justify-center gap-2 py-2"
                style={{
                  opacity: step >= 3 ? 1 : 0,
                  transform: step >= 3 ? "translateY(0)" : "translateY(15px)",
                  transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.15s",
                }}
              >
                {[
                  { icon: Heart, label: "Skincare" },
                  { icon: Sparkles, label: "Maquillaje" },
                  { icon: Crown, label: "Shampoo" },
                  { icon: Gift, label: "Tratamientos" },
                  { icon: ShoppingBag, label: "Accesorios" },
                ].map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 px-3 py-1.5 text-xs font-semibold text-[#c2410c] shadow-sm"
                  >
                    <Icon className="h-3 w-3" />
                    {label}
                  </span>
                ))}
              </div>

              {/* Urgency bar */}
              <div
                className="w-full overflow-hidden rounded-xl bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 px-4 py-3"
                style={{
                  opacity: step >= 4 ? 1 : 0,
                  transform: step >= 4 ? "translateY(0) scale(1)" : "translateY(10px) scale(0.95)",
                  transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                  border: "1px dashed rgba(249,115,22,0.3)",
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f97316]">
                    <Gift className="h-3.5 w-3.5 text-white" />
                  </div>
                  <p className="text-center text-xs font-bold text-[#9a3412]">
                    {"Oferta valida solo por tiempo limitado"}
                  </p>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f97316]">
                    <Sparkles className="h-3.5 w-3.5 text-white" />
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={handleClose}
                className="group relative mt-1 w-full overflow-hidden rounded-2xl py-4 text-lg font-bold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #ea580c 0%, #f97316 40%, #fb923c 60%, #f97316 100%)",
                  boxShadow: "0 8px 32px rgba(249,115,22,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
                  opacity: step >= 4 ? 1 : 0,
                  transform: step >= 4 ? "translateY(0)" : "translateY(15px)",
                  transition: "opacity 0.5s ease, transform 0.5s ease",
                }}
              >
                {/* Shimmer effect */}
                <div
                  className="absolute inset-0 animate-shimmer"
                  style={{
                    backgroundImage: "linear-gradient(110deg, transparent 25%, rgba(255,255,255,0.2) 50%, transparent 75%)",
                    backgroundSize: "200% 100%",
                  }}
                />
                <span className="relative flex items-center justify-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  {"Quiero mi descuento"}
                </span>
              </button>

              <p
                className="text-center text-[11px] text-[#aaa]"
                style={{
                  opacity: step >= 4 ? 1 : 0,
                  transition: "opacity 0.5s ease 0.2s",
                }}
              >
                {"Aplica en todos los productos - Solo por inauguracion"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
