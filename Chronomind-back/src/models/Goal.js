import mongoose from "mongoose";

const checkpointSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const goalSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    deadline: { type: Date, required: true },

    checkpoints: { type: [checkpointSchema], default: [] },

    progress: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Goal", goalSchema);
