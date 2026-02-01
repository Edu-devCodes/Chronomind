import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Confetti from "./Confetti";
import { FiEdit2, FiTrash2, FiX } from "react-icons/fi";

const WEEK = ["D", "S", "T", "Q", "Q", "S", "S"];

export default function HabitCard({ habit, onToggle, onEdit, onDelete }) {
  if (!habit) return null;

  const [confettiKey, setConfettiKey] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const color = habit.color || "#00ff88";
  const week = Array.isArray(habit.week) ? habit.week : [];

  const handleToggle = async () => {
    if (!onToggle) return;

    const updated = await onToggle(habit._id);

    if (!habit.doneToday && updated?.doneToday) {
      setConfettiKey(k => k + 1);
    }
  };

  const handleDelete = () => {
    onDelete(habit._id);
    setConfirmDelete(false);
  };

  return (
    <motion.div
      className="habit-card"
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.04 }}
      transition={{ type: "spring", stiffness: 220 }}
      style={{
        border: `1px solid ${color}55`,
        boxShadow: habit.doneToday
          ? `0 0 35px ${color}66`
          : `0 0 18px ${color}22`,
      }}
    >
      <Confetti trigger={confettiKey} color={color} />

      {/* AÇÕES */}
      <div className="habit-actions">
        {!confirmDelete ? (
          <>
            <button
              className="action-btn edit"
              onClick={() => onEdit(habit)}
            >
              <FiEdit2 />
            </button>

            <button
              className="action-btn delete"
              onClick={() => setConfirmDelete(true)}
            >
              <FiTrash2 />
            </button>
          </>
        ) : (
          <AnimatePresence>
            <motion.div
              className="delete-confirm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <button
                className="confirm-no"
                onClick={() => setConfirmDelete(false)}
              >
                <FiX />
              </button>

              <button
                className="confirm-yes"
                onClick={handleDelete}
              >
                Apagar
              </button>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <div className="habit-icon" style={{ background: color }}>
        {habit.icon || "🔥"}
      </div>

      <h3>{habit.name}</h3>

      <span className="habit-streak">
        🔥 {habit.streak || 0} dias
      </span>

      <div className="week-row">
        {WEEK.map((d, i) => (
          <span
            key={i}
            className="day"
            style={{
              background: week[i] ? color : "#1a1a1a",
              opacity: week[i] ? 1 : 0.3
            }}
          >
            {d}
          </span>
        ))}
      </div>

      <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={handleToggle}
        style={{ background: habit.doneToday ? color : "#151515" }}
      >
        {habit.doneToday ? "✓ Completo" : "Marcar como feito"}
      </motion.button>
    </motion.div>
  );
}
