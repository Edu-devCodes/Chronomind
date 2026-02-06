import fetch from "node-fetch";

const sendEmail = async (to, subject, code) => {
  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY, 
      },
      body: JSON.stringify({
        sender: {
          name: "ChronoMind Atlas",
          email: process.env.BREVO_FROM || "noreplychronomind@gmail.com",
        },
        to: [{ email: to }],
        subject,
        htmlContent: `
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
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Erro API Brevo: ${res.status} - ${errText}`);
    }

    console.log("📧 Email enviado via Brevo API:", to);

  } catch (err) {
    console.error("❌ Erro Brevo API:", err.message);
    throw new Error("Falha ao enviar email");
  }
};

export default sendEmail;