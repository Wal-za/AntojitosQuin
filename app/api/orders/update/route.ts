import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function PUT(req: NextRequest) {
  try {
    const { id, estado } = await req.json()
    const client = await clientPromise
    const db = client.db("antojitosquin")
    const orders = db.collection("orders")
    await orders.updateOne({ _id: new ObjectId(id) }, { $set: { estado } })
    return NextResponse.json({ message: "Estado actualizado" })
  } catch (error) {
    console.error("Error PUT order:", error)
    return NextResponse.json({ error: "Error al actualizar estado" }, { status: 500 })
  }
}
