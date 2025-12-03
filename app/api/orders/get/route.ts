import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("antojitosquin")
    const orders = db.collection("orders")
    const allOrders = await orders.find({}).toArray()
    return NextResponse.json(allOrders)
  } catch (error) {
    console.error("Error GET orders:", error)
    return NextResponse.json({ error: "Error al obtener pedidos" }, { status: 500 })
  }
}
