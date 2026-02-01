import Task from "../models/Task.js";

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

  complete: async (id, userId) => {
    return await Task.findOneAndUpdate(
      { _id: id, userId },
      { completed: true },
      { new: true }
    );
  },
};

export default TaskService;
