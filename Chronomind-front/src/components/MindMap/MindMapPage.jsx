// src/pages/MindMap/MindMapPage.jsx

import React, { useState } from "react";

import Sidebar from "../Dashboard/Sidebar/Sidebar";

import MindMapCanvas from "./MindMapCanvas";
import useMindMapData from "./useMindMapData";

import GoalServices from "../../services/goalsService";
import TasksService from "../../services/tasksService";
import HabitService from "../../services/habitService";
import MindMapLegend from "./MindMapLegend";

import "./mindmap.css";

export default function MindMapPage() {

  const {
    goals,
    tasks,
    habits,
    loading,
    reload
  } = useMindMapData();

  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState("goal");
  const [title, setTitle] = useState("");
  const [selectedGoal, setSelectedGoal] = useState("");

  if (loading) {
    return <div className="mindmap-loading">Carregando mapa...</div>;
  }


  /* ================================
     Reset Modal
  ================================= */

  function resetModal() {
    setTitle("");
    setType("goal");
    setSelectedGoal("");
    setShowModal(false);
  }


  /* ================================
     Criar Item
  ================================= */

  async function handleCreate() {

    if (!title.trim()) return;

    try {

      /* ========= META ========= */
      if (type === "goal") {

        await GoalServices.create({
          title,
          description: "",
          deadline: new Date()
        });

      }


      /* ========= TASK ========= */
      if (type === "task") {

        if (!selectedGoal) {
          alert("Selecione uma meta para a task.");
          return;
        }

        // 1️⃣ Criar task
        const taskRes = await TasksService.create({
          title,
          goalId: selectedGoal
        });

        const task = taskRes.data;

        // 2️⃣ Criar checkpoint na meta
        await GoalServices.addCheckpoint(
          selectedGoal,
          {
            checkpointId: task._id,
            title: task.title
          }
        );

      }


      /* ========= HÁBITO ========= */
      if (type === "habit") {

        if (!selectedGoal) {
          alert("Selecione uma meta para o hábito.");
          return;
        }

        await HabitService.create({
          name: title,
          linkedGoals: [selectedGoal]
        });

      }


      resetModal();
      reload();

    } catch (err) {
      console.error("Erro ao criar:", err);
      alert("Erro ao criar item.");
    }
  }



  return (
    <div className="mindmap-root">

      <div className="mindmap-layout">

        <Sidebar />

        <div className="mindmap-page">


          {/* Header */}
          <header className="mindmap-header">

            <div>
              <h1>🧠 Mapa Mental</h1>
              <p>Conecte metas, hábitos e tarefas</p>
            </div>

            <button
              className="mindmap-add-btn"
              onClick={() => setShowModal(true)}
            >
              ➕ Adicionar
            </button>

          </header>


          <div className="mindmap-wrapper">

            <MindMapCanvas
              goals={goals}
              tasks={tasks}
              habits={habits}
            />

            <MindMapLegend />

          </div>



          {/* Modal */}
          {showModal && (

            <div className="mindmap-modal-bg">

              <div className="mindmap-modal-advanced">

                <h2>Criar Novo</h2>
                <p>Escolha o tipo e dê um nome</p>


                {/* Tipo */}

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

                </div>


                {/* Input */}

                <input
                  placeholder="Digite o nome..."
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />


                {/* Select Meta (Task + Hábito) */}

                {(type === "task" || type === "habit") && (

                  <select
                    className="mindmap-goal-select"
                    value={selectedGoal}
                    onChange={e => setSelectedGoal(e.target.value)}
                  >

                    <option value="">
                      Selecione uma meta
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

              </div>

            </div>
          )}


        </div>

      </div>
    </div>
  );
}
