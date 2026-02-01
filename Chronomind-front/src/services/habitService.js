import api from "../api/api";

const HabitService = {
  list: () => api.get("/habits"),

  create: (data) => api.post("/habits", data),

  update: (id, data) => api.put(`/habits/${id}`, data),

  remove: (id) => api.delete(`/habits/${id}`),

  toggleToday: (id) => api.patch(`/habits/${id}/toggle`)
};

export default HabitService;
