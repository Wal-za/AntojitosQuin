import type React from "react"
import type { Metadata } from "next"
import { Nunito } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/context/cart-context"
import { ProductsProvider } from "@/context/products-context"
import { AdminAuthProvider } from "@/context/admin-auth-context"
import { OrdersProvider } from "@/context/orders-context"
import { WhatsAppButton } from "@/components/whatsapp-button"

const nunito = Nunito({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] })

export const metadata: Metadata = {
  title: "AntojitosQuin - Tu Tienda Virtual",
  description: "Encuentra los mejores productos: alimentos, cremas, belleza y más. ¡Ofertas increíbles te esperan!",
  generator: "v0.app",
  icons: {
    icon: "/favicon.png",      
    apple: "/favicon.png",     
    shortcut: "/favicon.png"   
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={nunito.className}>
      <body className="font-sans antialiased">
        <AdminAuthProvider>
          <ProductsProvider>
            <OrdersProvider>
              <CartProvider>
                {children}
              </CartProvider>
            </OrdersProvider>
          </ProductsProvider>
        </AdminAuthProvider>
        <WhatsAppButton />
      </body>
    </html>
  )
}
