import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const isAuthenticated = req.cookies.get("admin_session")?.value === "true";
  return NextResponse.json({ isAuthenticated });
}
