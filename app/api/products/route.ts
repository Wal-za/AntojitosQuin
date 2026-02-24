import { NextResponse } from "next/server"
import { createProduct, getAllProducts, searchProducts } from "@/lib/products-db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const search = searchParams.get("search")
    const category = searchParams.get("category")
    const discount = searchParams.get("discount")

    // 🔥 Control del descuento desde la URL
    // Ejemplo: /api/products?discount=true
    const DESCUENTO_ACTIVO = discount === "true"
    const PORCENTAJE_DESCUENTO = 0.10

    let products = search
      ? await searchProducts(search)
      : await getAllProducts()

    if (category) {
      products = products.filter(
        (p) => p.categoria === category
      )
    }

    // Orden ascendente por ID
    products = products.sort((a, b) => a.id - b.id)

    // 🔥 Aplicar descuento dinámicamente
    products = products.map((product) => {
      const precioConDescuento = DESCUENTO_ACTIVO
        ? Math.round(product.precioFinal * (1 - PORCENTAJE_DESCUENTO))
        : product.precioFinal

      return {
        ...product,
        precioConDescuento,
        descuentoAplicado: DESCUENTO_ACTIVO
      }
    })

    return NextResponse.json(products)

  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { error: "Error fetching products" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.nombre || !body.categoria) {
      return NextResponse.json(
        { error: "Nombre y categoría son obligatorios" },
        { status: 400 }
      )
    }

    const precioFinal =
      body.precioFinal && body.precioFinal > 0
        ? body.precioFinal
        : body.precioOriginal ?? 0

    const precioOriginal =
      body.precioOriginal && body.precioOriginal > 0
        ? body.precioOriginal
        : precioFinal

    const cleanVariants =
      body.variantes &&
      typeof body.variantes.tipo === "string" &&
      Array.isArray(body.variantes.opciones)
        ? {
            tipo: body.variantes.tipo,
            opciones: body.variantes.opciones.filter(
              (op: string) =>
                typeof op === "string" && op.trim() !== ""
            )
          }
        : null

    const product = await createProduct({
      nombre: body.nombre,
      categoria: body.categoria,
      precioCompra: body.precioCompra ?? 0,
      precioOriginal,
      precioFinal,
      descripcion: body.descripcion ?? "",
      imagenes: Array.isArray(body.imagenes) ? body.imagenes : [],
      etiqueta: body.etiqueta ?? null,
      stock: body.stock ?? 0,
      variantes: cleanVariants,
    })

    return NextResponse.json(product, { status: 201 })

  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json(
      { error: "Error creating product" },
      { status: 500 }
    )
  }
}