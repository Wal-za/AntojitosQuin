import nodemailer from "nodemailer";
import path from "path";


export async function sendOrderEmail(order: any) {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const faviconPath = path.join(__dirname, 'public', 'favicon.png');


    const mailOptions = {
      from: `"AntojitosQuin" <${process.env.EMAIL_USER}>`,
      to: order.cliente.correo,
      bcc: "dz677807@gmail.com",
      subject: `¡Gracias por tu pedido #${order.orderNumber}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
          
          <!-- Cabecera premium -->
          <div style="background: linear-gradient(135deg, #ff9a3c, #ff6f00); color: white; text-align: center; padding: 30px 20px; position: relative;">
            <img src="cid:logo" alt="Logo" style="width: 70px; vertical-align: middle; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.3);" />
            <h1 style="display: inline-block; margin-left: 15px; font-size: 32px; font-weight: 900; text-shadow: 1px 1px 4px rgba(0,0,0,0.3);">AntojitosQuin</h1>
            <p style="margin-top: 10px; font-size: 18px;">¡Tu pedido está en camino!</p>           
          </div>

          <!-- Saludo y número de orden -->
          <div style="padding: 20px;">
            <h2>Hola ${order.cliente.nombre},</h2>
            <p>¡Estamos muy contentos de que hayas comprado con nosotros! Aquí tienes los detalles de tu pedido:</p>
            
            <p><b>Número de orden:</b><br/>${order.orderNumber}</p>
            <p><b>Fecha:</b> ${new Date(order.createdAt).toLocaleString()}<br/>
            <b>Estado:</b> ${order.estado}<br/>
            <b>Método de pago:</b> ${order.metodoPago}</p>
          </div>

          <!-- Productos -->
          <div style="padding: 0 20px 20px 20px;">
            <h3>Detalle de tu pedido:</h3>
            ${order.productos
          .map(
            (item: any) => `
                  <div style="display: flex; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                    <img src="${item.imagen}" alt="${item.nombre}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-right: 15px;"/>
                    <div>
                      <p style="margin: 0; font-weight: bold;">${item.nombre}</p>
                      <p style="margin: 2px 0;">Cantidad: ${item.cantidad}</p>
                      <p style="margin: 2px 0;">Precio: $${item.precioFinal.toLocaleString()}</p>
                    </div>
                  </div>
                `
          )
          .join("")}
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
            <p>Si tienes alguna duda, contáctanos en <a href="mailto:soporte@antojitosquin.com" style="color: #ff6f61;">soporte@antojitosquin.com</a></p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: 'favicon.png',
          path: faviconPath,
          cid: 'logo'
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error enviando correo:", error);
    return { success: false, error };
  }
}
