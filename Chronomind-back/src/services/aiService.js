const HF_TOKEN = process.env.HF_API_KEY;
const HF_MODEL = process.env.HF_MODEL;

const HF_API_URL = "https://router.huggingface.co/v1/chat/completions";

export async function summarizeText(instruction) {
  const response = await fetch(HF_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: HF_MODEL,
      messages: [
        {
          role: "system",
          content: "Você é um assistente que segue instruções com extrema precisão."
        },
        {
          role: "user",
          content: instruction.trim()
        }
      ],
      temperature: 0.1,
      top_p: 0.9,
      max_tokens: 900
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HF ${response.status}: ${text}`);
  }

  const data = await response.json();

  return (data.choices?.[0]?.message?.content || "").trim();
}
