import * as pdfjsLib from "pdfjs-dist/build/pdf.mjs";

export async function extractTextFromPDF(buffer) {
  // 🔥 CONVERSÃO CORRETA
  const uint8Array = new Uint8Array(buffer);

  const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
  const pdf = await loadingTask.promise;

  let fullText = "";

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();

    const pageText = content.items
      .map(item => item.str)
      .join(" ");

    fullText += pageText + "\n";
  }

  return fullText.trim();
}
