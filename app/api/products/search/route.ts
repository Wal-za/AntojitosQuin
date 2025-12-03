import { NextResponse } from "next/server"
import { searchProducts } from "@/lib/products-db"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get("query")

  if (!query) {
    return NextResponse.json([], { status: 200 })
  }

  try {
    const products = await searchProducts(query)
    return NextResponse.json(products)
  } catch (error) {
    console.error("Error searching products:", error)
    return NextResponse.json({ error: "Error searching products" }, { status: 500 })
  }
}
