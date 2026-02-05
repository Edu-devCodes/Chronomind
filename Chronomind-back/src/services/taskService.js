import Task from "../models/Task.js";
import Goal from "../models/Goal.js";

const TaskService = {

  create: async (data) => {
    return await Task.create(data);
  },

  getAllByUser: async (userId) => {
    return await Task.find({ userId }).sort({ createdAt: -1 });
  },

  getById: async (id, userId) => {
    return await Task.findOne({ _id: id, userId });
  },

  update: async (id, userId, data) => {
    return await Task.findOneAndUpdate(
      { _id: id, userId },
      data,
      { new: true }
    );
  },

  delete: async (id, userId) => {
    return await Task.findOneAndDelete({ _id: id, userId });
  },

  // ✅ AQUI FALTAVA VÍRGULA
  complete: async (id, userId) => {

    // 1️⃣ Marca task como concluída
    const task = await Task.findOneAndUpdate(
      { _id: id, userId },
      { completed: true },
      { new: true }
    );

    if (!task) return null;

    // 2️⃣ Se tiver meta vinculada
    if (task.goalId) {

      const goal = await Goal.findOne({
        _id: task.goalId,
        userId
      });

      if (goal) {

        // 3️⃣ Acha checkpoint da task
        const checkpoint = goal.checkpoints.find(
          c => c.id.toString() === task._id.toString()
        );


        if (checkpoint) {

          checkpoint.completed = true;

          // 4️⃣ Recalcula progresso
          const completed =
            goal.checkpoints.filter(c => c.completed).length;

          goal.progress =
            (completed / goal.checkpoints.length) * 100;

          await goal.save();
        }
      }
    }

    return task;
  },

};

export default TaskService;
