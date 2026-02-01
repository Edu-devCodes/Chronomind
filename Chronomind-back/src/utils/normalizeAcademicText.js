import { summarizeText } from "../services/aiService.js";

/**
 * Normaliza linguagem acadêmica sem inventar conteúdo
 * - Corrige idioma
 * - Corrige frases quebradas
 * - Mantém TODA a informação
 */
export async function normalizeAcademicText(text) {
  return await summarizeText(`
Você é um REVISOR DE TEXTO ACADÊMICO.

OBJETIVO:
- Corrigir erros gramaticais e de concordância
- Ajustar clareza e fluidez SEM alterar o conteúdo

REGRAS ABSOLUTAS:
- NÃO resuma
- NÃO encurte frases
- NÃO remova informações
- NÃO una ideias diferentes
- NÃO acrescente conteúdo novo
- NÃO explique o que está fazendo
- NÃO use inglês

ORIENTAÇÃO:
- Preserve o tamanho original do texto
- Preserve todos os detalhes
- Apenas corrija linguagem e organização

FORMATO:
- Texto contínuo
- Português acadêmico formal
- Subtítulos APENAS se já estiverem implícitos no texto

TEXTO:
<<<
${text}
>>>
`);
}
