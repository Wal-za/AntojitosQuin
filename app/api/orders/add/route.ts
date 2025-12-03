import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function POST(req: NextRequest) {
  try {
    const order = await req.json()
    const client = await clientPromise
    const db = client.db("antojitosquin")
    const orders = db.collection("orders")

    const newOrder = {
      ...order,
      orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
    }

    const result = await orders.insertOne(newOrder)
    return NextResponse.json({ ...newOrder, _id: result.insertedId })
  } catch (error) {
    console.error("Error POST order:", error)
    return NextResponse.json({ error: "Error al agregar pedido" }, { status: 500 })
  }
}
