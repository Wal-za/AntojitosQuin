import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("antojitosquin");

    const orders = await db.collection("orders").find().sort({ createdAt: -1 }).toArray();

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("GET /api/orders/list error:", error);
    return NextResponse.json(
      { success: false, error: "No se pudieron obtener los pedidos" },
      { status: 500 }
    );
  }
}
