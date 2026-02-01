import mongoose from "mongoose";

const habitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    icon: {
      type: String,
      default: "💪"
    },

    color: {
      type: String,
      default: "#ff2d2d"
    },

    // 🔗 Metas ligadas ao hábito
    linkedGoals: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Goal"
      }
    ],

    completedDates: {
      type: [Date],
      default: []
    }
  },
  { timestamps: true }
);

export default mongoose.model("Habit", habitSchema);
