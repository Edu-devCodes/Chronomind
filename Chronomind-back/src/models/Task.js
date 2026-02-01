import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      default: ""
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium"
    },

    category: {
      type: String,
      default: "Acadêmico"
    },
    goalId: { 
      type:mongoose.Schema.Types.ObjectId,
      ref: "Goal",
      default: null
    },

    dueDate: {
      type: Date,
      default: null
    },

    // 🔗 integração com Pomodoro
    estimatedPomodoros: {
      type: Number,
      default: 1
    },

    completedPomodoros: {
      type: Number,
      default: 0
    },

    completed: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);

