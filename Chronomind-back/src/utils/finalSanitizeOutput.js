/**
 * Limpeza FINAL do texto gerado pela IA
 * Remove narrativas artificiais e lixo meta
 * NÃO remove conteúdo informativo real
 */
export function finalSanitizeOutput(text) {
  if (!text) return text;

  return text
    // narrativas artificiais comuns
    .replace(/the author is[^.\n]*\.?/gi, "")
    .replace(/he is a[^.\n]*\.?/gi, "")
    .replace(/she is a[^.\n]*\.?/gi, "")
    .replace(/this text[^.\n]*\.?/gi, "")
    .replace(/you are[^.\n]*\.?/gi, "")
    .replace(/você é[^.\n]*\.?/gi, "")

    // restos de instrução
    .replace(/revisor de texto acadêmico[^.\n]*\.?/gi, "")
    .replace(/texto acadêmico[^.\n]*\.?/gi, "")

    // inglês solto
    .replace(/\b(author|reviewer|academic|text)\b/gi, "")

    // normalização final
    .replace(/\s{2,}/g, " ")
    .replace(/[\r\n]{3,}/g, "\n\n")
    .trim();
}
