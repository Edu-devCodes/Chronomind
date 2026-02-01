// controllers/youtubeController.js
import Summary from "../models/Summary.js";
import UserSummary from "../models/UserSummary.js";
import { summarizeText } from "../services/aiService.js";
import { extractYoutubeId } from "../utils/extractYoutubeId.js";
import { transcribeYoutube } from "../utils/transcribeYoutube.js";

export async function generateYoutubeSummary(req, res) {
  try {
    const { url, title } = req.body;
    const userId = req.user.id;

    /* ===============================
       VALIDACOES BASICAS
    =============================== */

    if (!url || typeof url !== "string") {
      return res.status(400).json({
        message: "URL do YouTube é obrigatória",
      });
    }

    const videoId = extractYoutubeId(url);

    if (!videoId) {
      return res.status(400).json({
        message: "URL do YouTube inválida",
      });
    }

    /* ===============================
       CACHE GLOBAL
    =============================== */

    let summary = await Summary.findOne({
      contentType: "youtube",
      contentId: videoId,
    });

    /* ===============================
       NOVA TRANSCRICAO
    =============================== */

    if (!summary) {
      const text = await transcribeYoutube(url);

      if (!text || typeof text !== "string") {
        return res.status(422).json({
          message: "Não foi possível transcrever o áudio do vídeo",
        });
      }

      // mudei para um teste, padrao  30
      if (text.length < 10) {
        return res.status(422).json({
          message: "Transcrição muito curta para gerar resumo",
        });
      }

      /* ===============================
         PROMPT CONTROLADO
      =============================== */

      const aiSummary = await summarizeText(`
TIPO DE CONTEÚDO: YouTube
TÍTULO: ${title || "Vídeo do YouTube"}

INSTRUÇÕES:
- Gere um resumo claro e organizado
- Use tópicos quando fizer sentido
- Não invente informações
- Não repita frases
- Linguagem natural e objetiva
- Não cite que é uma transcrição

TEXTO:
<<<
${text}
>>>
      `);

      summary = await Summary.create({
        contentType: "youtube",
        contentId: videoId,
        title: title || "Vídeo do YouTube",
        summary: aiSummary,
        source: "ai",
        views: 1,
      });
    } else {
      summary.views += 1;
      await summary.save();
    }

    /* ===============================
       RELACAO COM USUARIO
    =============================== */

    await UserSummary.findOneAndUpdate(
      { userId, summaryId: summary._id },
      { userId, summaryId: summary._id },
      { upsert: true }
    );

    return res.json(summary);

  } catch (err) {
    console.error("YT ERROR:", err);

    return res.status(500).json({
      message: "Erro ao processar vídeo do YouTube",
    });
  }
}

