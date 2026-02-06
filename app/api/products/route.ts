import { NextResponse } from "next/server"
import { createProduct, getAllProducts, searchProducts } from "@/lib/products-db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const category = searchParams.get("category")

    let products

    if (search) {
      products = await searchProducts(search)
    } else {
      products = await getAllProducts()
    }

    if (category) {
      products = products.filter((p) => p.categoria === category)
    }

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Error fetching products" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Limpiar variantes vacías
    const cleanVariants = body.variantes && body.variantes.tipo
      ? {
          tipo: body.variantes.tipo,
          opciones: Array.isArray(body.variantes.opciones)
            ? body.variantes.opciones.filter((op: string) => op.trim() !== "")
            : []
        }
      : null

    // Ajustar precioFinal si no viene
    const precioFinal = (!body.precioFinal || body.precioFinal === 0)
      ? body.precioOriginal
      : body.precioFinal

    const product = await createProduct({
      nombre: body.nombre,
      categoria: body.categoria,
      precioCompra: body.precioCompra ?? 0,
      precioOriginal: (body.precioOriginal === 0 || body.precioOriginal == null) ? body.precioFinal : body.precioOriginal,
      precioFinal: precioFinal,
      descripcion: body.descripcion,
      imagenes: Array.isArray(body.imagenes) && body.imagenes.length > 0 ? body.imagenes : [],
      etiqueta: body.etiqueta || null,
      stock: body.stock ?? 0,
      variantes: cleanVariants, // <--- Aquí se guardan las variantes
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Error creating product" }, { status: 500 })
  }
}
