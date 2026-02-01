import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("❌ ERRO: MONGO_URI não está definida no .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, {
      dbName: "Chronomind",
    });
    console.log("✅ MongoDB conectado!");
  } catch (err) {
    console.error("Erro ao conectar ao MongoDB:", err);
    process.exit(1);
  }
}
