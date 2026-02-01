import api from "../api/api";

/**
 * Finaliza uma sessão de Pomodoro
 * Backend calcula duration e valida tudo
 */
export async function finishPomodoro({
  taskId = null,
  type,
  startedAt
}) {
  const res = await api.post("/pomodoro/finish", {
    taskId,
    type,
    startedAt
  });

  return res.data;
}

/**
 * Busca quantas sessões de foco foram feitas hoje
 */
export async function getTodayPomodoros() {
  const res = await api.get("/pomodoro/today");
  return res.data.count;
}
