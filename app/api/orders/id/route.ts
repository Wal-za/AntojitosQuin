import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise
    const db = client.db("antojitosquin")
    const orders = db.collection("orders")
    const order = await orders.findOne({ _id: new ObjectId(params.id) })
    if (!order) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
    return NextResponse.json(order)
  } catch (error) {
    console.error("Error GET order by id:", error)
    return NextResponse.json({ error: "Error al obtener pedido" }, { status: 500 })
  }
}
