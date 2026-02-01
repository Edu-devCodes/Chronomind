import { useState } from "react";
import { motion } from "framer-motion";

export default function SummaryTabs() {
  const [active, setActive] = useState("ai");

  return (
    <div className="summary-tabs">
      <motion.button
        layout
        className={active === "ai" ? "active" : ""}
        onClick={() => setActive("ai")}
      >
        Resumos com IA
      </motion.button>

      <motion.button
        layout
        className={active === "rec" ? "active" : ""}
        onClick={() => setActive("rec")}
      >
        Recomendações
      </motion.button>
    </div>
  );
}
