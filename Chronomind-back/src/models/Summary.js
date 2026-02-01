// aqui vai o resumo da iA ( GLOBAL )
import mongoose from "mongoose";

const summarySchema = new mongoose.Schema(
  {
    contentType: {
      type: String,
      enum: ["youtube", "pdf"],
      required: true
    },

    // ID externo (youtubeId, hash do pdf, etc)
    contentId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    title: {
      type: String,
      trim: true
    },

    summary: {
      type: String,
      required: true
    },

    source: {
      type: String,
      enum: ["cache", "transcription", "ai"],
      default: "ai"
    },

    views: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export default mongoose.model("Summary", summarySchema);
