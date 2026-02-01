import { execSync } from "child_process";

export function transcribeYoutube(url) {
  try {
    const output = execSync(
      `python scripts/ytdlp_transcribe.py "${url}"`,
      { encoding: "utf-8", maxBuffer: 1024 * 1024 * 20 }
    );

    if (
      !output ||
      output.toLowerCase().includes("error") ||
      output.toLowerCase().includes("warning")
    ) {
      throw new Error("Falha ao baixar áudio");
    }

    return output.trim();

  } catch (err) {
    console.error("YT ERROR:", err.message);

    throw new Error("Não foi possível processar o vídeo do YouTube.");
  }
}
