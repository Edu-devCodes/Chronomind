import nodemailer from "nodemailer";

const sendemail = async (to, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.APP_EMAIL,
                pass: process.env.PASS_APP
            },
        });

        await transporter.sendMail({
            from: `"ChronoMind Atlas" <${process.env.APP_EMAIL}>`,
            to,
            subject,
            html: `
        <div style="
            width: 100%;
            background: #000;
            padding: 40px 0;
            font-family: Arial, Helvetica, sans-serif;
            color: #ddd;
        ">
          <div style="
              max-width: 480px;
              margin: auto;
              background: #0c0c0c;
              padding: 35px 30px;
              border-radius: 14px;
              border: 1px solid #1c1c1c;
              box-shadow: 0 0 14px rgba(255, 0, 0, 0.25);
          ">

            <h2 style="
                text-align: center;
                color: #ff1a1a;
                font-size: 24px;
                margin-bottom: 12px;
                letter-spacing: 1px;
                text-transform: uppercase;
            ">
              Verificação da Conta
            </h2>

            <p style="
                text-align: center;
                color: #ccc;
                font-size: 14px;
                line-height: 1.5;
                margin-bottom: 22px;
            ">
              Use o código abaixo para confirmar sua conta no ChronoMind Atlas:
            </p>

            <div style="
                background: #141414;
                padding: 20px 0;
                border-radius: 12px;
                border: 1px solid #2a2a2a;
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 6px;
                text-align: center;
                color: #ff1a1a;
                box-shadow: 0 0 12px rgba(255, 0, 0, 0.25);
                margin: 25px auto;
            ">
              ${text}
            </div>

            <p style="
                text-align: center;
                color: #aaa;
                font-size: 13px;
                margin-top: 10px;
            ">
              Este código expira em <strong style="color:#ff1a1a;">10 minutos</strong>.
            </p>

            <hr style="border: none; border-top: 1px solid #222; margin: 30px 0;">

            <p style="
                text-align: center;
                color: #666;
                font-size: 12px;
                line-height: 1.5;
            ">
              Se você não solicitou este e-mail, apenas ignore.
            </p>

            <p style="
                margin-top: 25px;
                text-align: center;
                color: #ff1a1a;
                font-size: 13px;
                letter-spacing: 1px;
            ">
              — ChronoMind Atlas
            </p>

          </div>
        </div>
      `,
        });

        console.log("📧 E-mail enviado com sucesso para:", to);

    } catch (error) {
        console.error("❌ Erro ao enviar e-mail:", error.message);
    }
};

export default sendemail;
