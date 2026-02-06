// src/pages/MindMap/MindMapPage.jsx

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import Sidebar from "../Dashboard/Sidebar/Sidebar";
import MindMapCanvas from "./MindMapCanvas";
import useMindMapData from "./useMindMapData";
import {
  getCategories,
  saveCategories,
  addCategory
} from "../../utils/categories";
import Loading from "../../Loading/Loading"
import GoalServices from "../../services/goalsService";
import TasksService from "../../services/tasksService";
import HabitService from "../../services/habitService";
import MindMapLegend from "./MindMapLegend";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./mindmap.css";

const showSuccess = (msg) => {
  toast.success(msg, {
    position: "top-right",
    autoClose: 2200,
    theme: "dark",
  });
};

const showError = (msg) => {
  toast.error(msg, {
    position: "top-right",
    autoClose: 2200,
    theme: "dark",
  });
};
const CATEGORY_EMOJIS = [
  "📁", "📚", "💼", "🎯", "🧠", "💻", "📊", "📌",
  "🏃", "💪", "🎓", "📝", "🔥", "🚀", "⭐", "🗂️",
  "💡", "🎵", "🎮", "📖", "🏆", "⚙️", "🛠️"
];

export default function MindMapPage() {

  const {
    goals,
    tasks,
    habits,
    loading,
    reload
  } = useMindMapData();

  /* ================================
     States
  ================================= */

  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState("goal");
  const [title, setTitle] = useState("");
  const [selectedGoal, setSelectedGoal] = useState("");

  const [showHelp, setShowHelp] = useState(false);


  const [categoryName, setCategoryName] = useState("");
  const [categoryEmoji, setCategoryEmoji] = useState("📁");

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");


  useEffect(() => {
    const stored = getCategories();
    setCategories(stored);
  }, []);



  /* ================================
     Loading
  ================================= */

  if (loading) {
 return <Loading text="Carregando Mapa Mental..." />
  }



  /* ================================
     Reset Modal
  ================================= */

  function resetModal() {
    setTitle("");
    setType("goal");
    setSelectedGoal("");
    setCategoryName("");
    setCategoryEmoji("📁");
    setSelectedCategory("");
    setShowModal(false);
  }


  /* ================================
     Criar Item
  ================================= */

async function handleCreate() {

  /* ================= CATEGORIA ================= */
  if (type === "category") {

    if (!categoryName.trim()) {
      showError("Digite o nome da categoria");
      return;
    }

    if (!selectedGoal) {
      showError("Selecione uma meta para a categoria");
      return;
    }

    const newCat = {
      id: Date.now().toString(),
      name: categoryName.trim(),
      emoji: categoryEmoji || "📁",
      goalId: selectedGoal
    };

    addCategory(newCat);

    const stored = getCategories();
    setCategories(stored);

    showSuccess("Categoria criada com sucesso 🗂️");

    resetModal();
    return;
  }


  /* ================= GERAL ================= */

  if (!title.trim()) {
    showError("Digite um nome");
    return;
  }

  try {

    /* ================= META ================= */
    if (type === "goal") {

      await GoalServices.create({
        title: title.trim(),
        description: "",
        deadline: new Date(),
        categoryId: selectedCategory || null
      });

      showSuccess("Meta criada com sucesso 🎯");
    }


    /* ================= TASK ================= */
    if (type === "task") {

      if (!selectedGoal) {
        showError("Selecione uma meta.");
        return;
      }

      const taskRes = await TasksService.create({
        title: title.trim(),
        goalId: selectedGoal,

        description: "",
        priority: "medium",
        category: "Geral",

        dueDate: new Date().toISOString(),
        completed: false
      });

      const task = taskRes.data;

      await GoalServices.addCheckpoint(
        selectedGoal,
        {
          checkpointId: task._id,
          title: task.title
        }
      );

      showSuccess("Tarefa criada com sucesso ✅");
    }


    /* ================= HÁBITO ================= */
    if (type === "habit") {

      if (!selectedGoal) {
        showError("Selecione uma meta.");
        return;
      }

      await HabitService.create({
        name: title.trim(),
        linkedGoals: [selectedGoal]
      });

      showSuccess("Hábito criado com sucesso ⚡");
    }


    resetModal();
    reload();

  } catch (err) {

    console.error("Erro ao criar:", err);

    showError("Erro ao criar item");
  }
}


  /* ================================
     Render
  ================================= */

  return (

    <div className="mindmap-root">

      <div className="mindmap-layout">

        <Sidebar />

        <div className="mindmap-page">


          {/* ================= Header ================= */}

          <header className="mindmap-header">

            <div>
              <h1>🧠 Mapa Mental</h1>
              <p>Conectando metas, tarefas e hábitos</p>
            </div>

            <div className="mindmap-header-actions">

              {/* Botão Ajuda */}
              <button
                className="mindmap-help-btn"
                onClick={() => setShowHelp(true)}
              >
                ❔
              </button>

              {/* Botão Add */}
              <button
                className="mindmap-add-btn"
                onClick={() => setShowModal(true)}
              >
                ➕ Adicionar
              </button>

            </div>

          </header>


          {/* ================= Canvas ================= */}

          <div className="mindmap-wrapper">

            <MindMapLegend />

            <MindMapCanvas
              goals={goals}
              tasks={tasks}
              habits={habits}
              categories={categories}
              reload={reload}
            />

          </div>


          {/* ================= MODAL CREATE ================= */}

          <AnimatePresence>
            {showModal && (

              <motion.div
                className="mindmap-modal-bg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >

                <motion.div
                  className="mindmap-modal-advanced"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                >

                  <h2>Criar Novo</h2>
                  <p>Escolha o tipo e dê um nome</p>


                  {/* ================= Tipo ================= */}

                  <div className="modal-type-select">

                    <button
                      className={type === "goal" ? "active goal" : "goal"}
                      onClick={() => setType("goal")}
                    >
                      🎯
                      <span>Meta</span>
                    </button>

                    <button
                      className={type === "task" ? "active task" : "task"}
                      onClick={() => setType("task")}
                    >
                      ✅
                      <span>Task</span>
                    </button>

                    <button
                      className={type === "habit" ? "active habit" : "habit"}
                      onClick={() => setType("habit")}
                    >
                      ⚡
                      <span>Hábito</span>
                    </button>

                    <button
                      className={type === "category" ? "active category" : "category"}
                      onClick={() => setType("category")}
                    >
                      🗂️
                      <span>Categoria</span>
                    </button>

                  </div>


                  {/* ================= Nome ================= */}

                  <input
                    className="mindmap-main-input"
                    placeholder={
                      type === "category"
                        ? "Nome da categoria..."
                        : "Digite o nome..."
                    }
                    value={type === "category" ? categoryName : title}
                    onChange={e =>

                      type === "category"
                        ? setCategoryName(e.target.value)
                        : setTitle(e.target.value)

                    }
                  />


                  {/* ================= Categoria Inputs ================= */}

                  {type === "category" && (

                    <div className="category-picker">

                      <select
                        className="mindmap-goal-select"
                        value={selectedGoal}
                        onChange={e => setSelectedGoal(e.target.value)}
                      >
                        <option value="">
                          🎯 Vincular a uma meta
                        </option>

                        {goals.map(goal => (
                          <option key={goal._id} value={goal._id}>
                            {goal.title}
                          </option>
                        ))}
                      </select>
                      {CATEGORY_EMOJIS.map(emoji => (

                        <button
                          key={emoji}
                          type="button"

                          className={`emoji-btn ${categoryEmoji === emoji ? "active" : ""
                            }`}

                          onClick={() => setCategoryEmoji(emoji)}
                        >
                          {emoji}
                        </button>

                      ))}

                    </div>

                  )}





                  {/* ================= Select Meta ================= */}

                  {(type === "task" || type === "habit") && (

                    <select
                      className="mindmap-goal-select"
                      value={selectedGoal}
                      onChange={e => setSelectedGoal(e.target.value)}
                    >

                      <option value="">
                        🎯 Selecione uma meta
                      </option>

                      {goals.map(goal => (

                        <option
                          key={goal._id}
                          value={goal._id}
                        >
                          {goal.title}
                        </option>

                      ))}

                    </select>
                  )}



                  {/* Actions */}

                  <div className="modal-actions-advanced">

                    <button
                      className="cancel"
                      onClick={resetModal}
                    >
                      Cancelar
                    </button>

                    <button
                      className="confirm"
                      onClick={handleCreate}
                    >
                      Criar
                    </button>

                  </div>

                </motion.div>

              </motion.div>
            )}
          </AnimatePresence>



          {/* ================= MODAL HELP ================= */}

          <AnimatePresence>
            {showHelp && (

              <motion.div
                className="mindmap-modal-bg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >

                <motion.div
                  className="mindmap-help-modal"
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 40, opacity: 0 }}
                >

                  <h2>📌 Como funciona o sistema?</h2>

                  <p>
                    O ChronoMind conecta tudo em forma de mapa:
                  </p>

                  <ul>
                    <li>🎯 <b>Meta</b> = Objetivo principal</li>
                    <li>✅ <b>Task</b> = Etapa da meta</li>
                    <li>⚡ <b>Hábito</b> = Ação recorrente</li>
                  </ul>


                  <div className="mindmap-help-example">

                    <h4>💡 Exemplo prático</h4>

                    <p>
                      Meta: <b>"Passar no ENEM"</b>
                    </p>

                    <p>
                      Tasks:
                      <br />
                      → Estudar Matemática
                      <br />
                      → Fazer simulados
                    </p>

                    <p>
                      Hábito:
                      <br />
                      → Estudar 1h por dia
                    </p>

                    <p>
                      Tudo isso aparece conectado no mapa.
                    </p>

                  </div>


                  <p className="mindmap-help-footer">
                    O sistema usa essas relações para gerar
                    análises, progresso e organização automática.
                  </p>


                  <button
                    className="confirm"
                    onClick={() => setShowHelp(false)}
                  >
                    Entendi
                  </button>

                </motion.div>

              </motion.div>
            )}
          </AnimatePresence>


        </div>

      </div>
      <ToastContainer />
    </div >
  );
}
