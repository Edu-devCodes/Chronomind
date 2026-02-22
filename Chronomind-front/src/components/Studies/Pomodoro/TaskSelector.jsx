import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useMemo, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import "./Pomodoro.css";


/* 🌟 Mensagens quando vazio */
const emptyMessages = [
  {
    title: "✨ Tudo em dia!",
    text: "Você não tem nenhuma tarefa agora. Aproveite esse tempo ou crie algo novo."
  },
  {
    title: "🎯 Missão cumprida",
    text: "Todas as tarefas foram concluídas. Respire fundo — você merece."
  },
  {
    title: "🧠 Mente limpa",
    text: "Nada pendente por aqui. Um ótimo momento para focar em você."
  },
  {
    title: "🚀 Produtividade máxima",
    text: "Sua lista está vazia. Que tal planejar o próximo passo?"
  },
  {
    title: "☕ Pausa merecida",
    text: "Sem tarefas ativas no momento. Aproveite esse respiro."
  },
  {
    title: "🌙 Dia tranquilo",
    text: "Tudo sob controle. Às vezes, não fazer nada também é progresso."
  }
];


export default function TaskSelector({
  tasks = [],
  selectedTask,
  onSelect,
  running
}) {

  /* 🔎 estado de busca */
  const [search, setSearch] = useState("");


  /* 🎲 Mensagem aleatória (fixa até reload) */
  const randomMessage = useMemo(() => {
    const index = Math.floor(
      Math.random() * emptyMessages.length
    );

    return emptyMessages[index];
  }, []);

  /* 🔎 filtro */
  const filteredTasks = useMemo(() => {
    return tasks.filter(task =>
      task.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [tasks, search]);

  /* ===============================
     CASO NÃO TENHA TASK
  =============================== */
  if (tasks.length === 0) {
    return (
      <motion.div
        className="task-empty-state"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <h3>{randomMessage.title}</h3>
        <p>{randomMessage.text}</p>
      </motion.div>
    );
  }

  /* ===============================
     LISTA NORMAL
  =============================== */
  return (
    <div className="task-selector">

      {/* 🔎 INPUT FIXO ACIMA */}
      <div className="task-search-wrapper">

        <FiSearch className="search-icon" />

        <input
          type="text"
          placeholder="Buscar tarefa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="task-search-input"
        />

        {search && (
          <FiX
            className="clear-icon"
            onClick={() => setSearch("")}
          />
        )}

      </div>

      <div className="task-listPomodoro">

        {filteredTasks.length === 0 && (
          <p className="no-results">
            Nenhuma tarefa encontrada.
          </p>
        )}

        {filteredTasks.map(task => (
          <motion.button
            key={task._id}
            className={`task-item
            ${selectedTask?._id === task._id ? "active" : ""}
            ${running ? "locked" : ""}
          `}
            whileHover={!running ? { scale: 1.02 } : {}}
            whileTap={!running ? { scale: 0.97 } : {}}
            onClick={() => {

              if (running) {
                toast.warning(
                  "Pause o pomodoro antes de trocar a task ⏸️🔥"
                );
                return;
              }

              onSelect(task);
            }}
          >
            <span className="title">
              {task.title}
            </span>

            {task.priority && (
              <span className={`priority ${task.priority}`}>
                {task.priority}
              </span>
            )}
          </motion.button>
        ))}

      </div>
    </div>
  );
}
