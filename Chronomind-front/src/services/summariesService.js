import api from "./../api/api"; // seu axios configurado

export async function getUserSummaries({ page = 1, limit = 5 }) {
  const res = await api.get("/summaries", {
    params: { page, limit }
  });
  return res.data;
}
