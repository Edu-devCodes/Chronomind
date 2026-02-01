import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useMemo } from "react";
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

  /* 🎲 Mensagem aleatória (fixa até reload) */
  const randomMessage = useMemo(() => {
    const index = Math.floor(
      Math.random() * emptyMessages.length
    );

    return emptyMessages[index];
  }, []);

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
      <div className="task-listPomodoro">

        {tasks.map(task => (

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
              <span
                className={`priority ${task.priority}`}
              >
                {task.priority}
              </span>
            )}

          </motion.button>

        ))}

      </div>
    </div>
  );
}
