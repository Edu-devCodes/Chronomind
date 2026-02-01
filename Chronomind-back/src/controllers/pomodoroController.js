import {
  finishPomodoro,
  getTodayPomodorosCount
} from "../services/pomodoroService.js";

export async function finishPomodoroSession(req, res) {
  try {
    const userId = req.user.id;
    const { taskId, type, startedAt } = req.body;

    if (!startedAt || !type) {
      return res.status(400).json({ message: "Dados inválidos" });
    }

    const session = await finishPomodoro({
      userId,
      taskId,
      type,
      startedAt
    });

    res.json(session);
  } catch (err) {
    if (err.code === "DUPLICATE") {
      return res.status(409).json({ message: "Sessão já registrada" });
    }

    console.error(err);
    res.status(500).json({ message: "Erro ao finalizar pomodoro" });
  }
}

export async function getTodayPomodoros(req, res) {
  try {
    const userId = req.user.id;
    const count = await getTodayPomodorosCount(userId);
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "Erro ao buscar sessões" });
  }
}
