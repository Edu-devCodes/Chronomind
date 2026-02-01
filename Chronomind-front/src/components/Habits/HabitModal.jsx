import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./habits.css";

const EMOJIS = ["💪","📚","🧘","🏃","💧","🎨","🎵","🥗","😴"];

export default function HabitModal({ onClose, onCreate, onUpdate, habit }) {
  const isEdit = !!habit;

  const [name, setName] = useState("");
  const [color, setColor] = useState("#ff2d2d");
  const [icon, setIcon] = useState("💪");

  // 🔄 Preenche campos quando for edição
  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setColor(habit.color);
      setIcon(habit.icon);
    }
  }, [habit]);

  // 🔒 trava scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "auto");
  }, []);

  const handleSubmit = () => {
    if (!name.trim()) return;

    const data = { name, icon, color };

    if (isEdit) {
      onUpdate(habit._id, data);
    } else {
      onCreate(data);
    }

    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="modal-container"
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <header className="modal-header">
            <h2>{isEdit ? "Editar Hábito" : "Criar Novo Hábito"}</h2>
            <button onClick={onClose}>✕</button>
          </header>

          <label>Nome do Hábito</label>
          <input
            placeholder="Ex: Exercícios matinais"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label>Escolha um ícone</label>
          <div className="emoji-picker">
            {EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                className={icon === e ? "active" : ""}
                onClick={() => setIcon(e)}
              >
                {e}
              </button>
            ))}
          </div>

          <label>Escolha uma cor</label>
          <div className="color-picker">
            {[
              "#ff2d2d",
              "#ff9f0a",
              "#34c759",
              "#0a84ff",
              "#af52de",
              "#ff375f",
            ].map((c) => (
              <span
                key={c}
                style={{ background: c }}
                className={color === c ? "active" : ""}
                onClick={() => setColor(c)}
              />
            ))}
          </div>

          <label>Preview</label>
          <div className="habit-preview">
            <div className="habit-icon" style={{ background: color }}>
              {icon}
            </div>
            <div>
              <strong>{name || "Nome do hábito"}</strong>
              <span>0 dias de streak</span>
            </div>
          </div>

          <button className="create-btn" onClick={handleSubmit}>
            {isEdit ? "Salvar Alterações" : "Criar Hábito"}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
