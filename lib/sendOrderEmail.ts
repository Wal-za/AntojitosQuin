import nodemailer from "nodemailer";
import { getShippingCost } from "../context/shipping";

export async function sendOrderEmail(order: any) {
  try {
    // Configuración del transportador SMTP
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Calcular el costo de envío
    const shippingCost = getShippingCost(order.total);

    // Generar HTML de productos con variante incluida para diferenciación
    const productsHtml = order.productos
      .map((item: any) => {
        const uniqueKey = `${item.id}-${item.variante ?? "default"}`; // Clave única interna
        return `
          <div id="${uniqueKey}" style="display: flex; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
            <img src="${item.imagen}" alt="${item.nombre}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-right: 15px;"/>
            <div>
              <p style="margin: 0; font-weight: bold;">${item.nombre}${item.variante ? ` ${item.variante}` : ""}</p>
              <p style="margin: 2px 0;">Cantidad: ${item.cantidad}</p>
              <p style="margin: 2px 0;">Precio: $${item.precioFinal.toLocaleString()}</p>
            </div>
          </div>
        `;
      })
      .join("");

    // HTML final del correo
    const mailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
        <!-- Cabecera -->
        <div style="background: linear-gradient(135deg, #ff9a3c, #ff6f00); color: white; text-align: center; padding: 30px 20px; position: relative;">
          <img src="https://antojitos-quin.vercel.app/favicon.png" alt="Logo" style="width: 70px; vertical-align: middle; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.3);" />
          <h1 style="display: inline-block; margin-left: 15px; font-size: 32px; font-weight: 900; text-shadow: 1px 1px 4px rgba(0,0,0,0.3);">AntojitosQuin</h1>
          <p style="margin-top: 10px; font-size: 18px;">¡Tu pedido está en camino!</p>
        </div>

        <!-- Saludo y número de orden -->
        <div style="padding: 20px;">
          <h2>Hola ${order.cliente.nombre},</h2>
          <p>¡Estamos muy contentos de que hayas comprado con nosotros! Aquí tienes los detalles de tu pedido:</p>
          <p><b>Número de orden:</b> ${order.orderNumber}</p>
          <p><b>Fecha:</b> ${new Date(order.createdAt).toLocaleString("es-CO", { timeZone: "America/Bogota" })}</p>
          <p><b>Estado:</b> ${order.estado}</p>
          <p><b>Método de pago:</b> ${order.metodoPago}</p>
        </div>

        <!-- Productos -->
        <div style="padding: 0 20px 20px 20px;">
          <h3>Detalle de tu pedido:</h3>
          ${productsHtml}

          <!-- Envío -->
          <div style="display: flex; justify-content: space-between; font-weight: bold; margin-top: 15px;">
            <span>Envío:</span>
            <span>${shippingCost === 0 ? "Gratis" : `$${shippingCost.toLocaleString()}`}</span>
          </div>

          <!-- Total -->
          <h3 style="text-align: right; margin-top: 20px;">Total: $${order.total.toLocaleString()}</h3>
        </div>

        <!-- CTA / Marketing -->
        <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 2px solid #ff6f00;">
          <p style="font-size: 16px;">¡Nos encantaría verte de nuevo!</p>
          <a href="https://antojitos-quin.vercel.app/" style="display: inline-block; padding: 12px 25px; background-color: #ff6f61; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Explorar más productos</a>
        </div>

        <!-- Footer -->
        <div style="background-color: #333; color: white; text-align: center; padding: 15px; font-size: 12px;">
          <p>© 2025 AntojitosQuin. Todos los derechos reservados.</p>
          <p>Si tienes alguna duda, contáctanos en <a href="mailto:infoantojitosquin@gmail.com" style="color: #ff6f61;">infoantojitosquin@gmail.com</a></p>
        </div>
      </div>
    `;

    // Configuración final del correo
    const mailOptions = {
      from: `"AntojitosQuin" <${process.env.EMAIL_USER}>`,
      to: order.cliente.correo,
      bcc: "infoantojitosquin@gmail.com", // Copia oculta para el equipo de ventas
      subject: `¡Gracias por tu pedido #${order.orderNumber}!`,
      html: mailHtml,
    };

    await transporter.sendMail(mailOptions);

    return { success: true };
  } catch (error) {
    console.error("Error enviando correo:", error);
    return { success: false, error };
  }
}
