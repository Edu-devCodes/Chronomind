import api from "../api/api";


/* Gráficos */
export async function getChartsStats() {

  const res = await api.get("/stats/data");

  return res.data;
}


/* Dashboard */
export async function getDashboardStats() {

  const res = await api.get("/stats/dashboard");

  return res.data;
}
