import api from "../api/api";

const TasksService = {
  getAll: () => api.get("/tasks"),
  create: (data) => api.post("/tasks", data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  remove: (id) => api.delete(`/tasks/${id}`),
}

export default TasksService
// usar depois que eu terminar a interface