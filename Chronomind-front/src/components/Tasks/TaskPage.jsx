import React, { useState, useEffect, useMemo } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  FiArrowLeft,
  FiArrowRight,
  FiArrowUp,
  FiCheckCircle,
  FiZap,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";
import Loading from "../../Loading/Loading"
import Sidebar from "../Dashboard/Sidebar/Sidebar";
import TasksService from "../../services/tasksService";
import "./tasks.css";

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState("list");
  const [index, setIndex] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    category: "Acadêmico",
    dueDate: new Date().toISOString().split("T")[0],
  });

  /* ===============================
     API - GET
  ================================ */
  useEffect(() => {

    const loadTasks = async () => {
      try {
        setLoading(true)

        const { data } = await TasksService.getAll()
        setTasks(data)

      } catch (err) {
        console.error("Erro ao carregar tasks:", err)

      } finally {
        setLoading(false)
      }
    }

    loadTasks()

  }, [])

  /* ===============================
     FILTERS
  ================================ */
  const inProgressTasks = useMemo(
    () => tasks.filter(t => !t.completed),
    [tasks]
  );

  const completedTasks = useMemo(
    () => tasks.filter(t => t.completed),
    [tasks]
  );

  const task = inProgressTasks[index];

  /* ===============================
     CRUD
  ================================ */
  const handleCreate = async () => {
    if (!formData.title.trim()) {
      toast.error("O título é obrigatório!");
      return;
    }

    if (formData.title.length < 3) {
      toast.warning("O título deve ter pelo menos 3 caracteres");
      return;
    }

    try {
      if (editingTask) {
        const { data } = await TasksService.update(
          editingTask._id,
          formData
        );

        setTasks(tasks.map(t => (t._id === data._id ? data : t)));

        toast.success("Tarefa atualizada!");
      } else {
        const { data } = await TasksService.create({
          ...formData,
          completed: false,
        });

        setTasks([...tasks, data]);

        toast.success("Tarefa criada com sucesso!");
      }

      closeModal();

    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar tarefa");
    }
  };

  const openDeleteModal = task => {
    setTaskToDelete(task);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;

    try {
      await TasksService.remove(taskToDelete._id);

      setTasks(tasks.filter(t => t._id !== taskToDelete._id));

      toast.success("Tarefa excluída!");

    } catch (err) {
      console.error(err);
      toast.error("Erro ao excluir tarefa");
    }

    setIsDeleteOpen(false);
    setTaskToDelete(null);
  };

  const openEdit = task => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      category: task.category,
      dueDate: task.dueDate.split("T")[0],
    });
    setIsCreateOpen(true);
  };

  const closeModal = () => {
    setIsCreateOpen(false);
    setEditingTask(null);
    setFormData({
      title: "",
      description: "",
      priority: "medium",
      category: "Acadêmico",
      dueDate: new Date().toISOString().split("T")[0],
    });
  };

  /* ===============================
     ACTIONS
  ================================ */
  const next = () => {
    if (!inProgressTasks.length) return;
    setIndex(prev => (prev + 1) % inProgressTasks.length);
  };

  const increaseUrgency = async () => {
    if (!task) return;

    const order = ["low", "medium", "high"];

    const nextLevel =
      order[(order.indexOf(task.priority) + 1) % order.length];

    const taskId = task._id;

    // 1️⃣ Atualiza na hora
    setTasks(prev =>
      prev.map(t =>
        t._id === taskId
          ? { ...t, priority: nextLevel }
          : t
      )
    );

    // 2️⃣ Backend
    try {

      await TasksService.update(taskId, {
        ...task,
        priority: nextLevel,
      });

    } catch (err) {

      console.error(err);

      toast.error("Erro ao mudar prioridade ❌", {
        autoClose: 2000,
        theme: "dark",
      });

      // 3️⃣ Reverte
      setTasks(prev =>
        prev.map(t =>
          t._id === taskId
            ? { ...t, priority: task.priority }
            : t
        )
      );
    }
  };

  const completeTask = async () => {
    if (!task) return;

    const taskId = task._id;

    // 1️⃣ Atualiza na hora
    setTasks(prev =>
      prev.map(t =>
        t._id === taskId
          ? { ...t, completed: true }
          : t
      )
    );

    setIndex(0);

    // 2️⃣ Salva no backend
    try {

      await TasksService.complete(taskId);

      toast.success("Tarefa concluída ✅", {
        autoClose: 1800,
        theme: "dark",
      });

    } catch (err) {

      console.error(err);

      toast.error("Erro ao concluir tarefa ❌", {
        autoClose: 2000,
        theme: "dark",
      });

      // 3️⃣ Reverte se falhar
      setTasks(prev =>
        prev.map(t =>
          t._id === taskId
            ? { ...t, completed: false }
            : t
        )
      );
    }
  };


  /* ===============================
     MOTION
  ================================ */
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-6, 6]);
  const completeColor = useTransform(
    y,
    [-140, 0],
    ["#22ff88", "#ffffff"]
  );


  // Mensagens sortidas quando nao tiver tasks

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

  const randomMessage =
    emptyMessages[Math.floor(Math.random() * emptyMessages.length)];

  if (loading) {
    return <Loading text="Carregando tarefas..." />
  }
  return (

    <div className="layout">
      <Sidebar />

      <div className="page">
        {/* HEADER */}
        <div className="header">
          <div>
            <h1>TaskSwipe</h1>
            <p>Gerencie suas tarefas com gestos</p>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              className="btn secondary"
              onClick={() => {
                setMode(mode === "list" ? "swipe" : "list");
                setIndex(0);
              }}
            >
              <FiZap />
              {mode === "list" ? "Focus Mode" : "Edit Mode"}
            </button>

            <button className="btn primary" onClick={() => setIsCreateOpen(true)}>
              Nova Tarefa
            </button>
          </div>
        </div>

        {/* LIST MODE */}
        {mode === "list" && (
          <>
            {tasks.length === 0 && (
              <div className="empty-state">
                <h2>{randomMessage.title}</h2>
                <p>{randomMessage.text}</p>
              </div>
            )}

            {tasks.length > 0 && (
              <div className="list-columns">

                {/* EM ANDAMENTO */}
                <section>
                  <h2 className="list-title">
                    Em Andamento
                    <span>{inProgressTasks.length}</span>
                  </h2>

                  <div className="task-list">
                    {inProgressTasks.map(task => (
                      <motion.div
                        key={task._id}
                        className={`task-row ${task.priority}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div>
                          <h3>{task.title}</h3>
                          <p>{task.description}</p>

                          <div className="task-meta">
                            <span className={`badge ${task.priority}`}>
                              {task.priority}
                            </span>
                            <span className="date">
                              {new Date(task.dueDate).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                        </div>

                        <div className="task-actions">
                          <button onClick={() => openEdit(task)}>
                            <FiEdit2 />
                          </button>
                          <button onClick={() => openDeleteModal(task)}>
                            <FiTrash2 />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>

                {/* CONCLUÍDAS */}
                <section>
                  <h2 className="list-title muted">
                    Concluídas
                    <span>{completedTasks.length}</span>
                  </h2>

                  <div className="task-list">
                    {completedTasks.map(task => (
                      <div
                        key={task._id}
                        className={`task-row done ${task.priority}`}
                      >
                        <div>
                          <h3>{task.title}</h3>
                          <p>{task.description}</p>

                          <div className="task-meta">
                            <span className={`badge ${task.priority}`}>
                              {task.priority}
                            </span>
                            <span className="date">
                              {new Date(task.dueDate).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

              </div>
            )}
          </>
        )}



        {/* FOCUS MODE */}
        {mode === "swipe" && (
          <>
            {!task && (
              <div className="empty-focus">
                <h2>{randomMessage.title}</h2>
                <p>{randomMessage.text}</p>
              </div>
            )}

            {task && (
              <div className="swipe-clean-wrapper dark">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={task._id}
                    className={`swipe-clean-card dark ${task.priority}`}
                    drag
                    dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                    dragElastic={0.25}
                    style={{ x, y, rotate }}
                    transition={{ type: "spring", stiffness: 110, damping: 18 }}
                    onDragEnd={(e, info) => {
                      if (info.offset.y < -120) {
                        completeTask();
                      }
                      else if (info.offset.x > 120) next();
                      else if (info.offset.x < -120) increaseUrgency();
                      else {
                        x.set(0);
                        y.set(0);
                      }
                    }}
                  >
                    {/* SELO DE URGÊNCIA */}
                    <div className={`focus-badge ${task.priority}`}>
                      {task.priority === "high" && "Alta"}
                      {task.priority === "medium" && "Média"}
                      {task.priority === "low" && "Baixa"}
                    </div>

                    {/* AÇÃO */}
                    <motion.div
                      className="card-action top"
                      style={{ color: completeColor }}
                    >
                      <FiArrowUp /> Concluir
                    </motion.div>

                    {/* CONTEÚDO */}
                    <div className="focus-content">
                      <h2>{task.title}</h2>

                      <div className="divider" />

                      <p>{task.description}</p>

                      <div className="divider subtle" />

                      <div className="focus-meta">
                        <span>{task.category}</span>
                        <span>
                          {new Date(task.dueDate).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* BOTÕES */}
                <div className="swipe-buttons dark">
                  <button className="danger" onClick={increaseUrgency}>
                    <FiArrowLeft />
                  </button>
                  <button className="success" onClick={completeTask}>
                    <FiCheckCircle />
                  </button>
                  <button className="neutral" onClick={next}>
                    <FiArrowRight />
                  </button>
                </div>
              </div>
            )}
          </>
        )}



        {/* MODAL CREATE / EDIT */}
        <AnimatePresence>
          {isCreateOpen && (
            <motion.div
              className="modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="task-modal"
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {/* CLOSE */}
                <button className="modal-close" onClick={closeModal}>
                  ×
                </button>

                <h2>{editingTask ? "Editar tarefa" : "Nova tarefa"}</h2>

                <input
                  type="text"
                  placeholder="Título da tarefa"
                  value={formData.title}
                  onChange={e =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />

                <textarea
                  placeholder="Descrição"
                  value={formData.description}
                  onChange={e =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />

                <select
                  value={formData.priority}
                  onChange={e =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                >
                  <option value="low">Prioridade baixa</option>
                  <option value="medium">Prioridade média</option>
                  <option value="high">Prioridade alta</option>
                </select>

                <input
                  type="text"
                  placeholder="Categoria"
                  value={formData.category}
                  onChange={e =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                />

                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={e =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                />

                <button className="btn primary" onClick={handleCreate}>
                  {editingTask ? "Salvar alterações" : "Criar tarefa"}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* MODAL DELETE */}
        {isDeleteOpen && (
          <div className="modal">
            <div className="modal-content small">

              <h3>Excluir Tarefa</h3>

              <p>
                Tem certeza que deseja excluir "{taskToDelete?.title}"?
              </p>

              <div className="modal-footer">

                <button
                  className="btn"
                  onClick={() => {
                    setIsDeleteOpen(false);
                    setTaskToDelete(null);
                  }}
                >
                  Cancelar
                </button>

                <button
                  className="btn danger"
                  onClick={confirmDelete}
                >
                  Excluir
                </button>

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
