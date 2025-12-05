"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, User, MapPin, Phone, Mail, Check } from "lucide-react"
import { StoreHeader } from "@/components/store-header"
import { useCart } from "@/context/cart-context"
import { cn } from "@/lib/utils"

interface FormData {
  nombre: string
  direccion: string
  telefono: string
  correo: string
}

interface FormErrors {
  nombre?: string
  direccion?: string
  telefono?: string
  correo?: string
  departamento?: string
  ciudad?: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice } = useCart()
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    direccion: "",
    telefono: "",
    correo: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const [departamento, setDepartamento] = useState("")
  const [ciudad, setCiudad] = useState("")
  const departamentos = {
    "Antioquia": ["Medellín", "Bello", "Envigado", "Itagüí", "Sabaneta", "La Estrella", "Copacabana", "Girardota", "Barbosa", "Rionegro"],
    "Cundinamarca": ["Bogotá", "Soacha", "Chía", "Zipaquirá", "Facatativá", "Mosquera", "Funza", "Madrid", "Cajicá", "La Calera"],
    "Valle del Cauca": ["Cali", "Palmira", "Buenaventura", "Jamundí", "Tuluá", "Buga", "Cartago", "Florida", "Ginebra", "Guadalajara de Buga"],
    "Atlántico": ["Barranquilla", "Soledad", "Malambo", "Sabanalarga", "Galapa", "Puerto Colombia", "Baranoa", "Luruaco", "Urbano"],
    "Bolívar": ["Cartagena", "Magangué", "Turbaná", "Arjona", "El Carmen de Bolívar", "Santa Rosa", "Cicuco"],
    "Santander": ["Bucaramanga", "Floridablanca", "Girón", "Piedecuesta", "Barrancabermeja", "San Gil", "Lebrija", "Yariguíes", "Floridablanca"],
    "Norte de Santander": ["Cúcuta", "Ocaña", "Pamplona", "Villa del Rosario", "Los Patios", "El Zulia", "San Cayetano"],
    "Tolima": ["Ibagué", "Espinal", "Honda", "Líbano", "Cajamarca", "Melgar", "Fresno", "Mariquita", "Carmen de Apicalá"],
    "Boyacá": ["Tunja", "Duitama", "Sogamoso", "Chiquinquirá", "Paipa", "Villa de Leyva", "Moniquirá", "Belén", "Garagoa"],
    "Meta": ["Villavicencio", "Acacías", "Granada", "Cumaral", "Puerto López", "Restrepo", "Mapiripán", "Guamal"],
    "Caldas": ["Manizales", "Chinchiná", "La Dorada", "Aranzazu", "Neira", "Neira", "Villamaría"],
    "Córdoba": ["Montería", "Cereté", "Lorica", "Sahagún", "Montelíbano", "Planeta Rica", "Sincelejo"],
    "Huila": ["Neiva", "Pitalito", "Garzón", "La Plata", "Gigante", "Santa María", "Campoalegre"],
    "Nariño": ["Pasto", "Ipiales", "Tumaco", "Túquerres", "Sandona", "Samaniego", "La Cruz"],
    "Risaralda": ["Pereira", "Dosquebradas", "Santa Rosa de Cabal", "La Virginia", "Marsella", "Quinchía", "Belén de Umbría"],
    "Quindío": ["Armenia", "Calarcá", "La Tebaida", "Montenegro", "Quimbaya", "Filandia", "Salento"],
    "Casanare": ["Yopal", "Aguazul", "Villanueva", "Pore", "Nunchía", "Hato Corozal", "Tauramena"],
    "Cauca": ["Popayán", "Santander de Quilichao", "Puerto Tejada", "Patía", "Piendamó", "Timbiquí"],
    "Sucre": ["Sincelejo", "Sampués", "Coveñas", "Tolú", "Corozal", "San Marcos", "Santiago de Tolú"],
    "La Guajira": ["Riohacha", "Maicao", "Uribia", "Manaure", "Dibulla", "Fonseca", "Villanueva"],
    "Chocó": ["Quibdó", "Istmina", "Condoto", "Tadó", "Acandí", "Cértegui"],
    "Arauca": ["Arauca", "Arauquita", "Tame", "Fortul", "Saravena"],
    "Guaviare": ["San José del Guaviare", "Calamar", "El Retorno"],
    "Vaupés": ["Mitú", "Carurú", "Papunahua"],
    "Vichada": ["Puerto Carreño", "La Primavera", "Cumaribo"],
    "Putumayo": ["Mocoa", "Puerto Asís", "Puerto Caicedo", "Orito", "Villagarzón"]
  };

  const [policyAccepted, setPolicyAccepted] = useState(false)
  const [showPolicyModal, setShowPolicyModal] = useState(false)

  // Recuperar los datos del formulario desde sessionStorage al cargar la página
  useEffect(() => {
    const storedFormData = sessionStorage.getItem("checkout-form-data")
    if (storedFormData) {
      setFormData(JSON.parse(storedFormData))
    }
    if (items.length === 0) {
      router.push("/cart")
    }
  }, [items, router])

  const validateField = (name: keyof FormData, value: string): string | undefined => {
    switch (name) {
      case "nombre":
        return value.trim().length < 3 ? "El nombre debe tener al menos 3 caracteres" : undefined
      case "direccion":
        return value.trim().length < 10 ? "Ingresa una dirección válida" : undefined
      case "telefono":
        return !/^\d{10}$/.test(value.replace(/\D/g, "")) ? "Ingresa un teléfono válido (10 dígitos)" : undefined
      case "correo":
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "Ingresa un correo válido" : undefined
      default:
        return undefined
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const updatedData = { ...prev, [name]: value }

      // Guardar los datos actualizados en sessionStorage
      sessionStorage.setItem("checkout-form-data", JSON.stringify(updatedData))

      return updatedData
    })

    if (touched[name]) {
      const error = validateField(name as keyof FormData, value)
      setErrors((prev) => ({ ...prev, [name]: error }))
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    const error = validateField(name as keyof FormData, value)
    setErrors((prev) => ({ ...prev, [name]: error }))
  }

  const isFormValid = () => {
    const newErrors: FormErrors = {}
    let isValid = true

    Object.keys(formData).forEach((key) => {
      const error = validateField(key as keyof FormData, formData[key as keyof FormData])
      if (error) {
        newErrors[key as keyof FormErrors] = error
        isValid = false
      }
    })

    if (!departamento) {
      newErrors.departamento = "Debes seleccionar un departamento"
      isValid = false
    }
    if (!ciudad) {
      newErrors.ciudad = "Debes seleccionar una ciudad"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const allTouched: Record<string, boolean> = {}
    Object.keys(formData).forEach((field) => {
      allTouched[field] = true
    })
    setTouched(allTouched)

    if (!isFormValid()) return

    // Aquí procesas el envío del formulario (por ejemplo, redirigir a la página de pago)
    router.push("/payment")
  }

  return (
    <>
      <StoreHeader />
      <main className="container py-12">
        <h1 className="text-3xl font-bold mb-8">Confirmar datos</h1>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <User size={20} />
              <input
                type="text"
                name="nombre"
                id="nombre"
                placeholder="Nombre completo"
                value={formData.nombre}
                onChange={handleChange}
                onBlur={handleBlur}
                className="input"
              />
            </div>
            {errors.nombre && <p className="text-red-500">{errors.nombre}</p>}

            <div className="flex items-center space-x-2">
              <MapPin size={20} />
              <input
                type="text"
                name="direccion"
                id="direccion"
                placeholder="Dirección"
                value={formData.direccion}
                onChange={handleChange}
                onBlur={handleBlur}
                className="input"
              />
            </div>
            {errors.direccion && <p className="text-red-500">{errors.direccion}</p>}

            <div className="flex items-center space-x-2">
              <Phone size={20} />
              <input
                type="tel"
                name="telefono"
                id="telefono"
                placeholder="Teléfono"
                value={formData.telefono}
                onChange={handleChange}
                onBlur={handleBlur}
                className="input"
              />
            </div>
            {errors.telefono && <p className="text-red-500">{errors.telefono}</p>}

            <div className="flex items-center space-x-2">
              <Mail size={20} />
              <input
                type="email"
                name="correo"
                id="correo"
                placeholder="Correo electrónico"
                value={formData.correo}
                onChange={handleChange}
                onBlur={handleBlur}
                className="input"
              />
            </div>
            {errors.correo && <p className="text-red-500">{errors.correo}</p>}

            {/* Departamento */}
            <div className="flex items-center space-x-2">
              <label htmlFor="departamento" className="font-semibold">Departamento</label>
              <select
                id="departamento"
                value={departamento}
                onChange={(e) => setDepartamento(e.target.value)}
                className="input"
              >
                <option value="">Selecciona un departamento</option>
                {Object.keys(departamentos).map((dep) => (
                  <option key={dep} value={dep}>
                    {dep}
                  </option>
                ))}
              </select>
            </div>
            {errors.departamento && <p className="text-red-500">{errors.departamento}</p>}

            {/* Ciudad */}
            <div className="flex items-center space-x-2">
              <label htmlFor="ciudad" className="font-semibold">Ciudad</label>
              <select
                id="ciudad"
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                className="input"
              >
                <option value="">Selecciona una ciudad</option>
                {departamentos[departamento]?.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
            {errors.ciudad && <p className="text-red-500">{errors.ciudad}</p>}

            <button type="submit" className="btn btn-primary w-full">
              Continuar
            </button>
          </div>
        </form>
      </main>
    </>
  )
}
