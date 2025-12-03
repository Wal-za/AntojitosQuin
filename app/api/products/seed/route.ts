import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import initialProducts from "@/data/products.json"

export async function POST() {
  try {
    const db = await getDatabase()

    // Check if products already exist
    const existingCount = await db.collection("products").countDocuments()

    if (existingCount > 0) {
      return NextResponse.json({
        message: "Database already has products",
        count: existingCount,
      })
    }

    // Insert initial products from JSON
    await db.collection("products").insertMany(initialProducts)

    return NextResponse.json({
      message: "Database seeded successfully",
      count: initialProducts.length,
    })
  } catch (error) {
    console.error("Error seeding database:", error)
    return NextResponse.json({ error: "Error seeding database" }, { status: 500 })
  }
}
