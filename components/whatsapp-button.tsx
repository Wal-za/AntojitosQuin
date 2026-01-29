"use client"

import { FaWhatsapp } from "react-icons/fa"
import { useEffect, useState } from "react"

export function WhatsAppButton() {
  const [showButton, setShowButton] = useState(true)

  useEffect(() => {
    // Verifica si la URL contiene "admin-antojitosquin"
    if (window.location.href.includes("admin-antojitosquin")) {
      setShowButton(false)
    } else {
      //eliminar este else cuando se vaya a usar el whapssap
      setShowButton(false)
    }
  }, [])

  if (!showButton) return null

  const phoneNumber = "573012981296" 
  const message = "Hola, me interesa obtener más información sobre sus productos"
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl md:h-16 md:w-16"
      aria-label="Contactar por WhatsApp"
    >
      <FaWhatsapp className="h-7 w-7 md:h-8 md:w-8" />
    </a>
  )
}
