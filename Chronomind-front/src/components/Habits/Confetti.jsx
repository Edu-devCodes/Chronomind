import { motion } from "framer-motion";

const random = (min, max) => Math.random() * (max - min) + min;

export default function Confetti({ trigger, color }) {
  return (
    <div className="confetti-layer">
      {Array.from({ length: 32 }).map((_, i) => (
        <motion.span
          key={`${trigger}-${i}`} // 🔥 força recriação
          className="confetti"
          initial={{
            x: 0,
            y: 0,
            opacity: 1,
            rotate: 0,
            scale: random(0.6, 1.2),
          }}
          animate={{
            x: random(-180, 180),
            y: random(-120, -260),
            rotate: random(0, 360),
            opacity: 0,
          }}
          transition={{
            duration: 1.2,
            ease: "easeOut",
            delay: random(0, 0.15),
          }}
          style={{ background: color }}
        />
      ))}
    </div>
  );
}
