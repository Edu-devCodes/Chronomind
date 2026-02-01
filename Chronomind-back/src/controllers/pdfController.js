import Summary from "../models/Summary.js";
import UserSummary from "../models/UserSummary.js";
import { summarizeText } from "../services/aiService.js";
import { extractTextFromPDF } from "../services/pdfService.js";
import { hashBuffer } from "../utils/hashFile.js";
import { normalizeAcademicText } from "../utils/normalizeAcademicText.js";
import { isLikelyResume } from "../utils/detectDocumentType.js";
import { finalSanitizeOutput } from "../utils/finalSanitizeOutput.js";

/* ===============================
   UTILIDADES
================================ */

function cleanExtractedText(text) {
  return text
    .replace(/CNN\.com[\s\S]*?snapshots\s*\./gi, "")
    .replace(/Visit CNN iReport[\s\S]*?\./gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/[\r\n]{3,}/g, "\n\n")
    .trim();
}

function deduplicateParagraphs(text) {
  const paragraphs = text
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(p => p.length > 50);

  const unique = [];

  for (const p of paragraphs) {
    const isDuplicate = unique.some(u => {
      const min = Math.min(p.length, u.length);
      const max = Math.max(p.length, u.length);
      return min / max > 0.85;
    });
    if (!isDuplicate) unique.push(p);
  }

  return unique.join("\n\n");
}

function chunkText(text, maxSize = 700) {
  const paragraphs = text.split(/\n{2,}/);
  const chunks = [];
  let current = "";

  for (const p of paragraphs) {
    if ((current + p).length > maxSize) {
      if (current.trim()) chunks.push(current.trim());
      current = p + "\n\n";
    } else {
      current += p + "\n\n";
    }
  }

  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

function isValidText(text) {
  if (!text || text.length < 250) return false;
  const letters = text.match(/[a-zA-ZÀ-ÿ]/g)?.length || 0;
  return letters / text.length > 0.3;
}

/* ===============================
   CONTROLLER
================================ */

export async function summarizePDF(req, res) {
  try {
    const userId = req.user.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "PDF não enviado" });
    }

    const pdfHash = hashBuffer(file.buffer);
    let summary = await Summary.findOne({ contentId: pdfHash });

    if (!summary) {
      const rawText = await extractTextFromPDF(file.buffer);
      console.log("PDF RAW:", rawText.length);

      const isResume = isLikelyResume(rawText);
      console.log("PDF TYPE:", isResume ? "RESUME" : "ACADEMIC");

      let text = cleanExtractedText(rawText);
      text = deduplicateParagraphs(text);

      console.log("PDF CLEAN:", text.length);

      if (!isValidText(text)) {
        return res.status(400).json({ message: "PDF sem texto legível suficiente" });
      }

      let finalSummary;

      // ===============================
      // CURRÍCULO CURTO
      // ===============================
      if (isResume && text.length < 1500) {
        finalSummary = await summarizeText(`
Reorganize o conteúdo abaixo como um currículo profissional.

REGRAS:
- Não invente dados
- Não use inglês
- Não escreva narrativa
- Preserve TODAS as informações

FORMATO:
CARGOS / FUNÇÕES:
FORMAÇÃO:

TEXTO:
<<<
${text}
>>>
`);
      }

      // ===============================
      // PIPELINE COMPLETA
      // ===============================
      else {
        const chunks = chunkText(text, isResume ? 500 : 800);
        const extractedChunks = [];

        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          if (chunk.length < 200) continue;

          console.log(`IA chunk ${i + 1}/${chunks.length}`);

          const extracted = await summarizeText(`
Extraia apenas informações factuais do texto abaixo.

REGRAS:
- Não invente
- Não reorganize
- Não traduza
- Preserve frases

TEXTO:
<<<
${chunk}
>>>
`);

          if (extracted && extracted.length > 80) {
            extractedChunks.push(extracted);
          }
        }

        const merged = extractedChunks.join("\n\n");

        finalSummary = isResume
          ? await summarizeText(`
Organize como currículo, mantendo TODAS as informações.

TEXTO:
<<<
${merged}
>>>
`)
          : await normalizeAcademicText(merged);
      }

      // 🔥 LIMPEZA FINAL (CHAVE DO SISTEMA)
      finalSummary = finalSanitizeOutput(finalSummary);

      summary = await Summary.create({
        contentType: "pdf",
        contentId: pdfHash,
        title: file.originalname,
        summary: finalSummary,
        source: "ai"
      });
    } else {
      summary.views += 1;
      await summary.save();
    }

    await UserSummary.findOneAndUpdate(
      { userId, summaryId: summary._id },
      { userId, summaryId: summary._id },
      { upsert: true }
    );

    return res.json(summary);

  } catch (err) {
    console.error("Erro PDF:", err.message);
    return res.status(500).json({ message: "Erro ao processar PDF" });
  }
}
