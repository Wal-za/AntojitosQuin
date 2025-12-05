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

  useEffect(() => {
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
    setFormData((prev) => ({ ...prev, [name]: value }))

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
    Object.keys(formData).forEach((key) => { allTouched[key] = true })
    allTouched["departamento"] = true
    allTouched["ciudad"] = true
    setTouched(allTouched)

    if (isFormValid()) {
      const fullAddress = `${departamento}, ${ciudad}, ${formData.direccion}`
      const dataToSave = { ...formData, direccion: fullAddress }

      localStorage.setItem("antojitosquin-checkout", JSON.stringify(dataToSave))
      router.push("/payment")
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (items.length === 0) return null

  const inputClasses = (fieldName: keyof FormData) =>
    cn(
      "w-full px-4 py-3 pl-12 rounded-xl border bg-background transition-all",
      errors[fieldName] && touched[fieldName]
        ? "border-destructive focus:ring-destructive/50"
        : !errors[fieldName] && touched[fieldName] && formData[fieldName]
        ? "border-accent focus:ring-accent/50"
        : "border-border focus:ring-primary/50",
      "focus:outline-none focus:ring-2"
    )

  const selectClasses = (field: "departamento" | "ciudad") =>
    cn(
      "w-full px-4 py-3 rounded-xl border bg-background transition-all focus:outline-none focus:ring-2",
      errors[field] && touched[field] ? "border-destructive focus:ring-destructive/50" : "border-border focus:ring-primary/50"
    )

  const shippingCost = totalPrice < 50000 ? 10000 : totalPrice < 100000 ? 5000 : 0
  const formatShipping = shippingCost === 0 
    ? <span className="font-bold text-green-600">Gratis</span> 
    : formatPrice(shippingCost)
  const totalWithShipping = totalPrice + shippingCost

  let shippingMessage = ""
  if (totalPrice < 50000) {
    const diff = 50000 - totalPrice
    shippingMessage = `¡Estás cerca! Solo ` + 
      `<span class="font-bold text-green-800">${formatPrice(diff)}</span>` + 
      ` más y tu pedido tendrá envío por solo $5.000.`
  } else if (totalPrice < 100000) {
    const diff = 100000 - totalPrice
    shippingMessage = `¡Casi llegas! Agrega ` + 
      `<span class="font-bold text-green-800">${formatPrice(diff)}</span>` + 
      ` más para disfrutar de envío gratis en tu pedido.`
  }

  return (
    <div className="min-h-screen bg-background">
      <StoreHeader />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/cart" className="p-2 rounded-full hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Datos de Envío</h1>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">1</div>
            <span className="ml-2 text-sm font-medium text-foreground">Datos</span>
          </div>
          <div className="w-12 h-0.5 bg-border mx-2"></div>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold text-sm">2</div>
            <span className="ml-2 text-sm font-medium text-muted-foreground">Pago</span>
          </div>
          <div className="w-12 h-0.5 bg-border mx-2"></div>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold text-sm">3</div>
            <span className="ml-2 text-sm font-medium text-muted-foreground">Confirmación</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6 space-y-5">
            {/* Nombre */}
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-foreground mb-2">Nombre completo</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} onBlur={handleBlur} placeholder="Juan Pérez" className={inputClasses("nombre")} />
                {!errors.nombre && touched.nombre && formData.nombre && <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />}
              </div>
              {errors.nombre && touched.nombre && <p className="mt-1 text-sm text-destructive">{errors.nombre}</p>}
            </div>

            {/* Departamento / Ciudad */}
            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="departamento" className="block text-sm font-medium text-foreground mb-2">Departamento</label>
                <select id="departamento" value={departamento} onChange={(e) => { setDepartamento(e.target.value); setCiudad(""); }} className={selectClasses("departamento")}>
                  <option value="">Selecciona un departamento</option>
                  {Object.keys(departamentos).map(dep => (<option key={dep} value={dep}>{dep}</option>))}
                </select>
                {errors.departamento && touched.departamento && <p className="mt-1 text-sm text-destructive">{errors.departamento}</p>}
              </div>

              <div>
                <label htmlFor="ciudad" className="block text-sm font-medium text-foreground mb-2">Ciudad</label>
                <select id="ciudad" value={ciudad} onChange={(e) => setCiudad(e.target.value)} disabled={!departamento} className={selectClasses("ciudad")}>
                  <option value="">Selecciona una ciudad</option>
                  {departamento && departamentos[departamento].map(c => (<option key={c} value={c}>{c}</option>))}
                </select>
                {errors.ciudad && touched.ciudad && <p className="mt-1 text-sm text-destructive">{errors.ciudad}</p>}
              </div>
            </div>

            {/* Dirección */}
            <div>
              <label htmlFor="direccion" className="block text-sm font-medium text-foreground mb-2">Dirección de entrega</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input type="text" id="direccion" name="direccion" value={formData.direccion} onChange={handleChange} onBlur={handleBlur} placeholder="Calle 123 #45-67, Barrio, Ciudad" className={inputClasses("direccion")} />
                {!errors.direccion && touched.direccion && formData.direccion && <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />}
              </div>
              {errors.direccion && touched.direccion && <p className="mt-1 text-sm text-destructive">{errors.direccion}</p>}
            </div>

            {/* Teléfono */}
            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-foreground mb-2">Teléfono</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input type="tel" id="telefono" name="telefono" value={formData.telefono} onChange={handleChange} onBlur={handleBlur} placeholder="3001234567" className={inputClasses("telefono")} />
                {!errors.telefono && touched.telefono && formData.telefono && <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />}
              </div>
              {errors.telefono && touched.telefono && <p className="mt-1 text-sm text-destructive">{errors.telefono}</p>}
            </div>

            {/* Correo */}
            <div>
              <label htmlFor="correo" className="block text-sm font-medium text-foreground mb-2">Correo electrónico</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input type="email" id="correo" name="correo" value={formData.correo} onChange={handleChange} onBlur={handleBlur} placeholder="juan@email.com" className={inputClasses("correo")} />
                {!errors.correo && touched.correo && formData.correo && <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />}
              </div>
              {errors.correo && touched.correo && <p className="mt-1 text-sm text-destructive">{errors.correo}</p>}
            </div>
          </div>

          {/* Shipping & Total */}
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            {shippingMessage && (
              <p className="text-sm text-yellow-600" dangerouslySetInnerHTML={{ __html: shippingMessage }}></p>
            )}
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Envío:</span>
              <span>{formatShipping}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>{formatPrice(totalWithShipping)}</span>
            </div>
          </div>

          {/* Política de datos */}
          <div className="flex items-center gap-2">
            <input type="checkbox" id="policy" checked={policyAccepted} onChange={() => setPolicyAccepted(!policyAccepted)} />
            <label htmlFor="policy" className="text-sm text-foreground">Acepto la <button type="button" onClick={() => setShowPolicyModal(true)} className="text-primary underline">política de datos</button></label>
          </div>

          <button type="submit" disabled={!policyAccepted} className="w-full py-3 px-6 rounded-xl bg-primary text-primary-foreground font-bold disabled:opacity-50 disabled:cursor-not-allowed">Continuar</button>
        </form>

        {/* Modal */}
        {showPolicyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl max-w-lg w-full">
              <h2 className="text-xl font-bold mb-4">Política de Datos</h2>
              <p className="mb-4">Aquí va la política de tratamiento de datos.</p>
              <button onClick={() => setShowPolicyModal(false)} className="px-4 py-2 bg-primary text-white rounded-lg">Cerrar</button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
