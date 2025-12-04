import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { sendOrderEmail } from '@/lib/sendOrderEmail';


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const client = await clientPromise;
    const db = client.db("antojitosquin");

    await sendOrderEmail(body);
    //sendOrderEmail(body);

    const result = await db.collection("orders").insertOne(body);

    return NextResponse.json({ success: true, orderId: result.insertedId });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
