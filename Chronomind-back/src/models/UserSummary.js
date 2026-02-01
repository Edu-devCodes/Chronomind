import mongoose from "mongoose";

const userSummarySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    summaryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Summary",
      required: true
    },

    saved: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// evita duplicar o mesmo resumo pro mesmo usuário
userSummarySchema.index({ userId: 1, summaryId: 1 }, { unique: true });

export default mongoose.model("UserSummary", userSummarySchema);
