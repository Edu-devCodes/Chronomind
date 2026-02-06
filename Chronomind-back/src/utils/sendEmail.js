import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({

  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,

  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS,
  },

  tls: {
    rejectUnauthorized: false,
  },

  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

// Testa conexão ao subir servidor
transporter.verify((err) => {
  if (err) {
    console.error("❌ SMTP Brevo erro:", err);
  } else {
    console.log("✅ SMTP Brevo conectado");
  }
});

const sendEmail = async (to, subject, code) => {
  try {

    await transporter.sendMail({

      from: `"ChronoMind Atlas" <${process.env.BREVO_FROM}>`,
      to,
      subject,

      html: `
      <div style="width:100%;background:#000;padding:40px 0;font-family:Arial;color:#ddd;">
        <div style="max-width:480px;margin:auto;background:#0c0c0c;padding:35px 30px;border-radius:14px;border:1px solid #1c1c1c;">

          <h2 style="text-align:center;color:#ff1a1a;">
            Verificação da Conta
          </h2>

          <p style="text-align:center;color:#ccc;">
            Use o código abaixo:
          </p>

          <div style="
            background:#141414;
            padding:20px 0;
            border-radius:12px;
            border:1px solid #2a2a2a;
            font-size:32px;
            font-weight:bold;
            letter-spacing:6px;
            text-align:center;
            color:#ff1a1a;
            margin:25px auto;
          ">
            ${code}
          </div>

          <p style="text-align:center;color:#aaa;">
            Expira em 10 minutos.
          </p>

          <p style="text-align:center;color:#666;font-size:12px;">
            — ChronoMind Atlas
          </p>

        </div>
      </div>
      `,
    });

    console.log("📧 Email enviado:", to);

  } catch (err) {

    console.error("❌ Erro Brevo:", err);

    throw new Error("Falha ao enviar email");
  }
};

export default sendEmail;