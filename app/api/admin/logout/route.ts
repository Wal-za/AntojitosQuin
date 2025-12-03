import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ success: true });

  // Borra la cookie de sesión
  res.cookies.set({
    name: "admin_session",
    value: "",
    httpOnly: true,
    path: "/",
    maxAge: 0,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return res;
}
