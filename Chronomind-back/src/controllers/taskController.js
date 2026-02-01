import TaskService from "../services/taskService.js";

const TaskController = {
  create: async (req, res) => {
    try {
      const task = await TaskService.create({
        ...req.body,
        userId: req.user.id,
      });

      return res.status(201).json(task);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao criar tarefa" });
    }
  },

  getAll: async (req, res) => {
    try {
      const tasks = await TaskService.getAllByUser(req.user.id);
      return res.json(tasks);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar tarefas" });
    }
  },

  getById: async (req, res) => {
    try {
      const task = await TaskService.getById(
        req.params.id,
        req.user.id
      );

      if (!task) {
        return res.status(404).json({ error: "Tarefa não encontrada" });
      }

      return res.json(task);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar tarefa" });
    }
  },

  update: async (req, res) => {
    try {
      const task = await TaskService.update(
        req.params.id,
        req.user.id,
        req.body
      );

      if (!task) {
        return res.status(404).json({ error: "Tarefa não encontrada" });
      }

      return res.json(task);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao atualizar tarefa" });
    }
  },

  remove: async (req, res) => {
    try {
      const task = await TaskService.delete(
        req.params.id,
        req.user.id
      );

      if (!task) {
        return res.status(404).json({ error: "Tarefa não encontrada" });
      }

      return res.json({ message: "Tarefa removida com sucesso" });
    } catch (error) {
      return res.status(500).json({ error: "Erro ao deletar tarefa" });
    }
  },

  complete: async (req, res) => {
    try {
      const task = await TaskService.complete(
        req.params.id,
        req.user.id
      );

      if (!task) {
        return res.status(404).json({ error: "Tarefa não encontrada" });
      }

      return res.json(task);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao concluir tarefa" });
    }
  },
};

export default TaskController;
