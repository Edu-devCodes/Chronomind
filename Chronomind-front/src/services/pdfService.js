import  api  from "../api/api";

/**
 * Envia um PDF para o backend e recebe o resumo
 * @param {File} file
 */
export async function summarizePDF(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/pdf", formData);
  return response.data;
}

