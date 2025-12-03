import {
  Store,
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Instagram,
  CreditCard,
  Truck,
  ShieldCheck,
  Headphones,
} from "lucide-react"

export function StoreFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-foreground text-background">
      {/* Features Bar */}
      <div className="border-b border-background/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Envío Rápido</p>
                <p className="text-xs text-background/60">A todo el país</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                <CreditCard className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="font-semibold text-sm">Pago Seguro</p>
                <p className="text-xs text-background/60">100% protegido</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Garantía</p>
                <p className="text-xs text-background/60">Productos originales</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Headphones className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Soporte 24/7</p>
                <p className="text-xs text-background/60">Estamos para ti</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Store className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-lg">AntojitosQuin</h3>
                <p className="text-xs text-background/60">Tu tienda virtual</p>
              </div>
            </div>
            <p className="text-sm text-background/70 leading-relaxed max-w-md">
              Somos tu tienda de confianza con los mejores productos en alimentos, belleza y cuidado personal. Precios
              increíbles y calidad garantizada.
            </p>
            {
              /* 
              iconos de redes sociales deshabilitados por ahora
             <div className="flex gap-3">
               <a
                 href="#"
                 className="w-10 h-10 rounded-full bg-background/10 hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors"
                 aria-label="Facebook"
               >
                 <Facebook className="w-5 h-5" />
               </a>
               <a
                 href="#"
                 className="w-10 h-10 rounded-full bg-background/10 hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors"
                 aria-label="Instagram"
               >
                 {
                 <Instagram className="w-5 h-5" />
                 }
               </a>
             </div>
             */
            }
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-4 text-primary">Contacto</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-background/70">Medellin, Colombia</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <a href="tel:+1234567890" className="text-sm text-background/70 hover:text-primary transition-colors">
                  3012981296
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <a
                  href="mailto:info@antojitosquin.com"
                  className="text-sm text-background/70 hover:text-primary transition-colors"
                >
                  infoantojitosquin@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div className="text-sm text-background/70">
                  <p>Lun - Sáb: 9:00 AM - 6:00 PM</p>
                  <p>Dom: Cerrado</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-background/50">
            <p>© {currentYear} AntojitosQuin. Todos los derechos reservados.</p>
            <p>Hecho con dedicación para nuestros clientes</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
