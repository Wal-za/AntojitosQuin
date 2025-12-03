import { NextRequest, NextResponse } from "next/server";

// Tiempo de vida de la cookie en segundos (ej: 1 hora)
const COOKIE_MAX_AGE = 60 * 60;

// Lista de usuarios permitidos
const ADMIN_USERS = [
  { username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD }, 
  { username: process.env.ADMIN_USERNAME2, password: process.env.ADMIN_PASSWORD2 }, 
  // Puedes agregar más usuarios aquí
];

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    console.log("Login recibido:", { username, password });

    // Buscar un usuario válido que coincida
    const userValid = ADMIN_USERS.find(
      (user) => user.username === username && user.password === password
    );

    if (userValid) {
      const res = NextResponse.json({ success: true });

      // Guardar cookie HTTP-only de sesión
      res.cookies.set({
        name: "admin_session",
        value: "true",
        httpOnly: true,
        path: "/",
        maxAge: COOKIE_MAX_AGE,
        secure: process.env.NODE_ENV === "production" ? true : false,
        sameSite: "strict",
      });

      console.log("Login exitoso, cookie seteada");
      return res;
    }

    console.log("Credenciales incorrectas");
    return NextResponse.json({ success: false }, { status: 401 });
  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
