import React, { useState, useEffect } from "react";
import GoalServices from "../../services/goalsService";
import Sidebar from "../Dashboard/Sidebar/Sidebar";
import "./goals.css";
import { FiPlus } from "react-icons/fi";



const emptyGoalMessages = [
  {
    title: "🚀 Sem metas por enquanto",
    text: "Você ainda não criou nenhuma meta. Que tal definir seu próximo objetivo?"
  },
  {
    title: "🌱 Hora de crescer",
    text: "Nada na sua lista de metas. Crie uma para acompanhar seu progresso!"
  },
  {
    title: "🎯 Pronto para focar?",
    text: "Nenhuma meta ativa. Defina seu próximo alvo e comece agora."
  },
  {
    title: "✨ Tudo em ordem",
    text: "Sua lista de metas está vazia. Aproveite para planejar algo novo."
  },
  {
    title: "🔥 Motivação máxima",
    text: "Sem metas definidas. Que tal criar um desafio para você mesmo?"
  },
  {
    title: "🧠 Planejamento tranquilo",
    text: "Nenhuma meta no momento. Um ótimo momento para pensar no futuro!"
  }
];

export function getRandomEmptyGoalMessage() {
  const index = Math.floor(Math.random() * emptyGoalMessages.length);
  return emptyGoalMessages[index];
}

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  // ---------- LOAD GOALS ----------
  useEffect(() => {
    async function load() {
      try {
        const res = await GoalServices.list();
        setGoals(res.data);
      } catch (err) {
        console.error("Erro ao carregar metas", err);
      }
    }
    load();
  }, []);

  

  // ---------- FORM STATE ----------
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: new Date(Date.now() + 30 * 86400000)
      .toISOString()
      .split("T")[0],
    checkpoints: [{ id: "1", title: "", completed: false }],
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      deadline: new Date(Date.now() + 30 * 86400000)
        .toISOString()
        .split("T")[0],
      checkpoints: [{ id: "1", title: "", completed: false }],
    });
  };


  // ---------- HELPERS ----------
  const calculateProgress = (checkpoints) => {
    if (!checkpoints.length) return 0;
    const done = checkpoints.filter((c) => c.completed).length;
    return Math.round((done / checkpoints.length) * 100);
  };

  const addGoal = (goal) => setGoals((prev) => [...prev, goal]);

  const updateGoalLocal = (id, data) =>
    setGoals((prev) => prev.map((g) => (g._id === id ? { ...g, ...data } : g)));

  const deleteGoal = (id) => {
    setGoals((prev) => prev.filter((g) => g._id !== id));
    setIsDeleteOpen(false);
  };

  // ---------- TOGGLE CHECKPOINT ----------
  const toggleCheckpoint = async (goalId, cpId) => {
    const updatedGoal = goals.find((g) => g._id === goalId);
    if (!updatedGoal) return;

    const checkpoints = updatedGoal.checkpoints.map((cp) =>
      cp.id === cpId ? { ...cp, completed: !cp.completed } : cp
    );

    const progress = calculateProgress(checkpoints);

    try {
      const res = await GoalServices.update(goalId, {
        ...updatedGoal,
        checkpoints,
        progress,
      });

      updateGoalLocal(goalId, res.data);
    } catch (err) {
      console.error("Erro ao atualizar checkpoint", err);
    }
  };

  // ---------- X CHECKPOINTS ----------
  const addCheckpointField = () => {
    setFormData((prev) => ({
      ...prev,
      checkpoints: [
        ...prev.checkpoints,
        { id: Date.now().toString(), title: "", completed: false },
      ],
    }));
  };

  const removeCheckpointField = (id) => {
    setFormData((prev) => ({
      ...prev,
      checkpoints: prev.checkpoints.filter((cp) => cp.id !== id),
    }));
  };

  const updateCheckpointField = (id, title) => {
    setFormData((prev) => ({
      ...prev,
      checkpoints: prev.checkpoints.map((cp) =>
        cp.id === id ? { ...cp, title } : cp
      ),
    }));
  };


  // ---------- CREATE ----------
  const handleCreate = async () => {
    if (!formData.title.trim()) return;

    const valid = formData.checkpoints.filter((c) => c.title.trim());
    if (valid.length === 0) return;

    const progress = calculateProgress(valid);

    const payload = {
      ...formData,
      checkpoints: valid,
      progress,
    };

    try {
      const res = await GoalServices.create(payload);
      addGoal(res.data);
      resetForm();
      setIsCreateOpen(false);
    } catch (error) {
      console.error("Erro ao criar meta", error);
    }
  };

  // ---------- EDIT ----------
  const openEditModal = (goal) => {
    setSelectedGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description,
      deadline: goal.deadline.split("T")[0],
      checkpoints: goal.checkpoints,
    });
    setIsEditOpen(true);
  };

  const handleEdit = async () => {
    const progress = calculateProgress(formData.checkpoints);

    try {
      const res = await GoalServices.update(selectedGoal._id, {
        ...formData,
        progress,
      });

      updateGoalLocal(selectedGoal._id, res.data);
      setIsEditOpen(false);
    } catch (err) {
      console.error("Erro ao editar meta", err);
    }
  };

  // ---------- COUNTS ----------
  const completedGoals = goals.filter((g) => g.progress >= 100).length;

  return (
    <div className="goals-layout">
      <Sidebar />

      <div className="goals-page">
        {/* HEADER */}
        <header className="page-header">
          <h1>Metas</h1>
          <p>Acompanhe seu progresso e conquistas</p>

          <button
            className="btn primary desktop-add-btn"
            onClick={() => {
              resetForm();
              setIsCreateOpen(true);
            }}
          >
            Nova Meta
          </button>

        </header>

        {/* STAT CARDS */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{goals.length}</h3>
            <p>Total de Metas</p>
          </div>

          <div className="stat-card">
            <h3>{completedGoals}</h3>
            <p>Concluídas</p>
          </div>

          <div className="stat-card">
            <h3>{goals.length - completedGoals}</h3>
            <p>Em Progresso</p>
          </div>

          <div className="stat-card">
            <h3>
              {Math.round(
                goals.reduce((a, g) => a + g.progress, 0) / goals.length || 0
              )}
              %
            </h3>
            <p>Média Geral</p>
          </div>
        </div>

        {/* GOALS GRID */}
<div className="goals-grid">
  {goals.length > 0 ? (
    goals.map((goal) => {
      const completed = goal.checkpoints.filter(c => c.completed).length;
      const total = goal.checkpoints.length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

      return (
        <div
          key={goal._id}
          className={`goal-card ${progress >= 100 ? "goal-complete" : ""}`}
          style={{ "--progress": `${progress}%` }}  // 🔴 controla a barra do topo
        >
          <div className="goal-header">
            <h2>{goal.title}</h2>

            <div className="goal-actions">
              <button
                onClick={() => openEditModal(goal)}
                className="btn small"
              >
                Editar
              </button>

              <button
                className="btn small danger"
                onClick={() => {
                  setSelectedGoal(goal);
                  setIsDeleteOpen(true);
                }}
              >
                Excluir
              </button>
            </div>
          </div>

          <p className="goal-desc">{goal.description}</p>

          {/* TEXTO DE PROGRESSO (SEM BARRA VISUAL) */}
          <div className="progress-text">
            {completed}/{total} checkpoints
          </div>

          <p className="deadline">
            Prazo: {new Date(goal.deadline).toLocaleDateString("pt-BR")}
          </p>

          <div className="cp-list">
            {goal.checkpoints.map((cp) => (
              <div
                key={cp.id}
                className={`cp-item ${cp.completed ? "cp-done" : ""}`}
                onClick={() => toggleCheckpoint(goal._id, cp.id)}
              >
                <input type="checkbox" checked={cp.completed} readOnly />
                <span>{cp.title}</span>
              </div>
            ))}
          </div>
        </div>
      );
    })
  ) : (
    (() => {
      const msg = getRandomEmptyGoalMessage();
      return (
        <div className="empty-goals-message">
          <h3>{msg.title}</h3>
          <p>{msg.text}</p>
        </div>
      );
    })()
  )}
</div>


        {/* ------- MODAIS ------- */}

        {/* CREATE */}
        {isCreateOpen && (
          <div className="modal">
            <div className="modal-content scrollable">
              <h2>Nova Meta</h2>

              <label>Título</label>
              <input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />

              <label>Descrição</label>
              <textarea
                className="big-textarea"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />

              <label>Prazo</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) =>
                  setFormData({ ...formData, deadline: e.target.value })
                }
              />

              <label>Checkpoints</label>
              {formData.checkpoints.map((cp) => (
                <div key={cp.id} className="cp-edit-row">
                  <input
                    value={cp.title}
                    onChange={(e) =>
                      updateCheckpointField(cp.id, e.target.value)
                    }
                  />

                  {formData.checkpoints.length > 1 && (
                    <button
                      className="btn danger small"
                      onClick={() => removeCheckpointField(cp.id)}
                    >
                      X
                    </button>
                  )}
                </div>
              ))}

              <button className="btn secondary" onClick={addCheckpointField}>
                + Adicionar Checkpoint
              </button>

              <div className="modal-footer">
                <button className="btn" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </button>
                <button className="btn primary" onClick={handleCreate}>
                  Criar Meta
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EDIT */}
        {isEditOpen && (
          <div className="modal">
            <div className="modal-content scrollable">
              <h2>Editar Meta</h2>

              <label>Título</label>
              <input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />

              <label>Descrição</label>
              <textarea
                className="big-textarea"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />

              <label>Prazo</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) =>
                  setFormData({ ...formData, deadline: e.target.value })
                }
              />

              <label>Checkpoints</label>
              {formData.checkpoints.map((cp) => (
                <div key={cp.id} className="cp-edit-row">
                  <input
                    value={cp.title}
                    onChange={(e) =>
                      updateCheckpointField(cp.id, e.target.value)
                    }
                  />

                  {formData.checkpoints.length > 1 && (
                    <button
                      className="btn danger small"
                      onClick={() => removeCheckpointField(cp.id)}
                    >
                      X
                    </button>
                  )}
                </div>
              ))}

              <button className="btn secondary" onClick={addCheckpointField}>
                + Adicionar Checkpoint
              </button>

              <div className="modal-footer">
                <button className="btn" onClick={() => setIsEditOpen(false)}>
                  Cancelar
                </button>
                <button className="btn primary" onClick={handleEdit}>
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DELETE */}
        {isDeleteOpen && (
          <div className="modal">
            <div className="modal-content small">
              <h3>Excluir Meta</h3>
              <p>Tem certeza que deseja excluir "{selectedGoal?.title}"?</p>

              <div className="modal-footer">
                <button className="btn" onClick={() => setIsDeleteOpen(false)}>
                  Cancelar
                </button>

                <button
                  className="btn danger"
                  onClick={async () => {
                    await GoalServices.remove(selectedGoal._id);
                    deleteGoal(selectedGoal._id);
                  }}
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* BOTÃO MOBILE */}
<button
  className="mobile-add-btn"
  onClick={() => {
    resetForm();
    setIsCreateOpen(true);
  }}
>
  <FiPlus />
</button>

    </div>
  );
}
