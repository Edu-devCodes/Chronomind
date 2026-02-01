import api from "../api/api";

/**
 * Gera resumo (YouTube ou texto)
 */
export async function generateSummary({
  contentType,
  contentId,
  title,
  text,
  url,
}) {
  const response = await api.post("/summary/youtube", {
    contentType,
    contentId,
    title,
    text,
    url, // usado pelo backend no caso do YouTube
  });

  return response.data;
}
