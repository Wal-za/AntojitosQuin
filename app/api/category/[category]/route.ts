import { NextResponse } from "next/server"
import { getProductsByCategory } from "@/lib/products-db"

interface Params {
  params: {
    category: string
  }
}

export async function GET(req: Request, { params }: Params) {
  try {
    const category = decodeURIComponent(params.category)
    const products = await getProductsByCategory(category)
    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching category products:", error)
    return NextResponse.json({ error: "Error fetching category products" }, { status: 500 })
  }
}
