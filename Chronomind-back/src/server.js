import "./config/env.js";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import goalRoutes from "./routes/goalRouter.js";
import taskRoutes from "./routes/taskRouter.js";
import habitRoutes from "./routes/habitRouter.js";
// import youtubeRoutes from "./routes/youtubeRoutes.js";
import pdfRoutes from "./routes/pdfRoutes.js";
import summariesRoutes from "./routes/summariesRoutes.js";
import pomodoroRoutes from "./routes/pomodorRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000; 

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));

// Rota de ping
app.get("/ping", (req, res) => {
  res.status(200).json({ status: "ok", time: new Date()});
});

app.use("/stats", statsRoutes);
app.use("/pomodoro/", pomodoroRoutes); 
app.use("/summaries", summariesRoutes);
app.use("/pdf", pdfRoutes);
app.use("/habits", habitRoutes);
app.use('/tasks', taskRoutes);
app.use('/goals', goalRoutes);
app.use('/auth', authRoutes);

app.use("/summary", (req, res) => {
  res.status(500).json({ message: "Resumo pelo YouTube temporariamente indisponível" });
});


connectDB();  
console.log("EMAIL:", process.env.BREVO_FROM);
console.log("PASS:", process.env.BREVO_PASS ? "OK" : "VAZIA");
console.log("USER:", process.env.BREVO_USER ? "OK" : "VAZIA");

app.listen(PORT, () =>
  console.log(`API rodando no render na porta :${PORT}`)
);

export default app;
