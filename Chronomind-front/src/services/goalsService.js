import api from "../api/api";

const GoalServices = {

  list: () => api.get("/goals"),

  create: (data) => api.post("/goals", data),

  update: (id, data) => api.put(`/goals/${id}`, data),

  remove: (id) => api.delete(`/goals/${id}`),

  addCheckpoint: (goalId, data) =>
    api.put(`/goals/attCheckpoint/${goalId}`, data)
};

export default GoalServices;
