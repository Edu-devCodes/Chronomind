import axios from "axios";
import fs from "fs";

const API_KEY = process.env.ASSEMBLYAI_API_KEY;

const headers = {
  authorization: API_KEY,
  "content-type": "application/json",
};

export async function transcribeAudio(audioPath) {
  // 1️⃣ upload do áudio
  const audioData = fs.readFileSync(audioPath);

  const uploadRes = await axios.post(
    "https://api.assemblyai.com/v2/upload",
    audioData,
    { headers }
  );

  // 2️⃣ solicitar transcrição
  const transcriptRes = await axios.post(
    "https://api.assemblyai.com/v2/transcript",
    {
      audio_url: uploadRes.data.upload_url,
      language_code: "pt",
    },
    { headers }
  );

  const transcriptId = transcriptRes.data.id;

  // 3️⃣ polling
  while (true) {
    const statusRes = await axios.get(
      `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
      { headers }
    );

    if (statusRes.data.status === "completed") {
      return statusRes.data.text;
    }

    if (statusRes.data.status === "error") {
      throw new Error("Erro na transcrição AssemblyAI");
    }

    await new Promise(r => setTimeout(r, 3000));
  }
}
