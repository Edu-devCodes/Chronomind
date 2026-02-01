import mongoose from "mongoose";

const pomodoroSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null
    },

    type: {
      type: String,
      enum: ["focus", "break"],
      required: true
    },

    duration: {
      type: Number, // segundos
      required: true
    },

    startedAt: {
      type: Date,
      required: true
    },

    finishedAt: {
      type: Date,
      required: true
    },

    completed: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("PomodoroSession", pomodoroSessionSchema);
