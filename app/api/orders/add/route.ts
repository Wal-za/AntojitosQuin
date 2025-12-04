import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function POST(req: NextRequest) {
  try {
    // Obtener datos del pedido desde el cuerpo de la solicitud
    const order = await req.json()

    // Conectar a MongoDB
    const client = await clientPromise
    const db = client.db("antojitosquin")
    const orders = db.collection("orders")

    // Calcular costo de envío según la lógica de checkout
    const shippingCost =
      order.totalPrice < 50000
        ? 10000
        : order.totalPrice < 100000
        ? 5000
        : 0

    // Preparar el nuevo pedido con shipping y total final
    const newOrder = {
      ...order,
      shipping: shippingCost,
      total: order.totalPrice + shippingCost,
      orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
    }

    // Insertar en la colección de pedidos
    const result = await orders.insertOne(newOrder)

    // Devolver el pedido completo con _id
    return NextResponse.json({ ...newOrder, _id: result.insertedId })
  } catch (error) {
    console.error("Error POST order:", error)
    return NextResponse.json({ error: "Error al agregar pedido" }, { status: 500 })
  }
}
