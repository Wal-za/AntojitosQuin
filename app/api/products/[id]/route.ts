import { NextResponse } from "next/server"
import { getProductById, updateProduct, deleteProduct } from "@/lib/products-db"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await getProductById(Number(id))

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ error: "Error fetching product" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Limpiar variantes vacías
    const cleanVariants = body.variantes && body.variantes.tipo
      ? {
        tipo: body.variantes.tipo,
        opciones: body.variantes.opciones.filter((op: string) => op.trim() !== "")
      }
      : null

    const updatedData = {
      ...body,
      precioCompra: body.precioCompra ?? 0,
      precioFinal: (body.precioFinal === 0 || body.precioFinal == null) ? body.precioOriginal : body.precioFinal,
      variantes: cleanVariants
    }

    const updatedProduct = await updateProduct(Number(id), updatedData)

    if (!updatedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Error updating product" }, { status: 500 })
  }
}


export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const deleted = await deleteProduct(Number(id))

    if (!deleted) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Error deleting product" }, { status: 500 })
  }
}
