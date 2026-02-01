import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },

  passwordHash: { type: String, required: true },

  name: { type: String, default: null },

  bio: { type: String, default: null },

  avatar: { type: String, default: null },

  isVerified: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now },

  refreshToken: { type: String, default: null }
});

export default mongoose.model("User", userSchema);
