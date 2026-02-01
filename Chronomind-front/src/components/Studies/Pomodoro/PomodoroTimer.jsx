import { motion } from "framer-motion";

export default function PomodoroTimer({ timeLeft, progress, mode }) {
  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");

  return (
    <div className="pomodoro-timer">
      <motion.div
        className="timer-ring"
        style={{
          background: `conic-gradient(
            ${mode === "focus" ? "#dc2626" : "#444"} ${progress * 360}deg,
            #1a1a1a 0deg
          )`
        }}
        animate={{ scale: [1, 1.015, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="timer-inner">
          <span className="time">{minutes}:{seconds}</span>
          <span className="label">
            {mode === "focus" ? "TEMPO DE FOCO" : "TEMPO DE PAUSA"}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
