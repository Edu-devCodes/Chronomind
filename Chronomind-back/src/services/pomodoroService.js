import PomodoroSession from "../models/PomodoroSession.js";
import Task from "../models/Task.js";

export async function finishPomodoro({
  userId,
  taskId,
  type,
  startedAt,
  confirmed
}) {
  const start = new Date(startedAt);
  const finishedAt = new Date();

  const duration = Math.floor((finishedAt - start) / 1000);

  // ⛔ proteção básica
  if (duration < 10) {
    throw new Error("Sessão inválida");
  }

  // 🛑 evita duplicação
  const exists = await PomodoroSession.findOne({
    userId,
    taskId,
    type,
    startedAt: start
  });

  if (exists) {
    const err = new Error("Sessão duplicada");
    err.code = "DUPLICATE";
    throw err;
  }

  const session = await PomodoroSession.create({
    userId,
    taskId,
    type,
    duration,
    startedAt: start,
    finishedAt,
    completed: true
  });

  // 🔗 sincroniza task
  if (taskId && type === "focus" && confirmed) {
    const task = await Task.findOne({ _id: taskId, userId });

    if (task) {
      task.completedPomodoros += 1;

      if (task.completedPomodoros >= task.estimatedPomodoros) {
        task.completed = true;
      }

      await task.save();
    }
  }

  return session;
}

export async function getTodayPomodorosCount(userId) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  return PomodoroSession.countDocuments({
    userId,
    type: "focus",
    completed: true,
    createdAt: { $gte: startOfDay, $lte: endOfDay }
  });
}
