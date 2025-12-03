import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const orderNumber = searchParams.get("orderNumber")

    if (!orderNumber)
      return NextResponse.json({ success: false, error: "Missing orderNumber" }, { status: 400 })

    const client = await clientPromise
    const db = client.db("antojitosquin")

    const order = await db.collection("orders").findOne({ orderNumber })

    if (!order)
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })

    return NextResponse.json({ success: true, order })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}
