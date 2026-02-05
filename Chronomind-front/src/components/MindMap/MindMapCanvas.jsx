import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  useMemo
} from "react";
import { FiTrash2 } from "react-icons/fi";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useEdgesState,
  useNodesState,
  applyNodeChanges,
  applyEdgeChanges
} from "reactflow";
  
import GoalServices from "../../services/goalsService";
import TasksService from "../../services/tasksService";
import HabitService from "../../services/habitService";
import { toPng } from "html-to-image";

import { toast } from "react-toastify";
import {
  getCategories,
  saveCategories
} from "../../utils/categories";
import "react-toastify/dist/ReactToastify.css";
import "reactflow/dist/style.css";

/* ===============================
   Constantes
================================ */

const STORAGE_KEY = "chronomind_map_layout";
const HIDDEN_KEY = "hidden_goals";

/* ===============================
   Componente
================================ */

export default function MindMapCanvas({
  goals,
  tasks,
  habits,
  categories,
  reload
}) {

  const wrapperRef = useRef(null);

  /* ===============================
     States
  ================================ */

  const [nodes, setNodes, onNodesChange] =
    useNodesState([]);

  const [edges, setEdges, onEdgesChange] =
    useEdgesState([]);
  

  const [hiddenGoals, setHiddenGoals] = useState(
    JSON.parse(localStorage.getItem(HIDDEN_KEY) || "[]")
  );

  const [initialized, setInitialized] =
    useState(false);

  const [panelClosed, setPanelClosed] =
    useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState(null);

  /* ===============================
     Load Layout
  ================================ */

  useEffect(() => {

    const saved =
      localStorage.getItem(STORAGE_KEY);

    if (!saved) return;

    try {

      const parsed = JSON.parse(saved);

      if (parsed.nodes && parsed.edges) {

        setNodes(parsed.nodes);
        setEdges(parsed.edges);

        setInitialized(true);

      }

    } catch (err) {
      console.error(err);
    }

  }, []);

  /* ===============================
     Build Graph
  ================================ */

  useEffect(() => {

    if (!goals.length) return;

    buildGraph();

  }, [goals, tasks, habits, categories]);



  function buildGraph() {

    const saved =
      JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

    const savedNodes = saved.nodes || [];

    function getPos(id, x, y) {

      const found =
        savedNodes.find(n => n.id === id);

      return found?.position || { x, y };
    }

    const newNodes = [];
    const newEdges = [];

    /* Center */


    /* Goals */

    goals.forEach((goal, index) => {

      const id = `goal-${goal._id}`;

      const checkpoints = goal.checkpoints || [];

      const done = checkpoints.filter(c => c.completed).length;

      const total = checkpoints.length || 1;

      const percent = Math.round((done / total) * 100);


      newNodes.push({
        id,

        position: getPos(
          id,
          100,
          100 + index * 160
        ),

        data: {
          label: `🎯 ${goal.title}\n${done}/${total} • ${percent}%`,
          goalId: goal._id
        },

        style: {
          ...goalStyle,
          boxShadow: `0 0 12px rgba(255,48,48,${percent / 150})`
        }
      });

      newEdges.push({
        id: `e-center-${id}`,
        source: "center",
        target: id
      });

    });

    /* Categories */

    categories.forEach((cat, index) => {

      if (!cat.goalId) return;

      const id = `category-${cat.id}`;

      newNodes.push({
        id,

        position: getPos(
          id,
          350,
          100 + index * 120
        ),

        data: {
          label: `${cat.emoji} ${cat.name}`
        },

        style: {
          ...categoryStyle
        }
      });

      newEdges.push({
        id: `e-cat-${cat.goalId}-${id}`,
        source: `goal-${cat.goalId}`,
        target: id
      });

    });

    /* Tasks */

    tasks.forEach((task, index) => {

      if (!task.goalId) return;

      const id = `task-${task._id}`;

      newNodes.push({
        id,

        position: getPos(
          id,
          550,
          100 + index * 130
        ),

        data: {
          label: `✅ ${task.title}`
        },

        style: {
          ...taskStyle,

          opacity: task.completed ? 0.6 : 1,

          background: task.completed
            ? "linear-gradient(135deg, #1a1a1a, #101010)" // cinza quando concluído
            : taskStyle.background, // mantém o original

          border: task.completed
            ? "1.5px solid rgba(180,180,180,0.4)"
            : taskStyle.border, // mantém o original

          textDecoration: task.completed
            ? "line-through"
            : "none",

          boxShadow: task.completed
            ? "0 0 12px rgba(180,180,180,0.25)"
            : taskStyle.boxShadow, // mantém o original

          color: task.completed
            ? "#9ca3af"
            : taskStyle.color // mantém o original
        }


      });

      newEdges.push({
        id: `e-${task.goalId}-${id}`,
        source: `goal-${task.goalId}`,
        target: id
      });

    });

    /* Habits */

    habits.forEach((habit, index) => {

      if (!habit.linkedGoals?.length) return;

      const id = `habit-${habit._id}`;

      newNodes.push({
        id,

        position: getPos(
          id,
          850,
          100 + index * 140
        ),

        data: {
          label: `${habit.icon} ${habit.name}`
        },

        style: {
          ...habitStyle,

          opacity: habit.doneToday ? 0.6 : 1,

          background: habit.doneToday
            ? "linear-gradient(135deg, #141414, #0d0d0d)"
            : habitStyle.background,

          border: habit.doneToday
            ? "1.5px solid rgba(180,180,180,0.4)"
            : habitStyle.border,

          boxShadow: habit.doneToday
            ? "0 0 10px rgba(180,180,180,0.2)"
            : habitStyle.boxShadow,

          color: habit.doneToday
            ? "#9ca3af"
            : habitStyle.color,

          textDecoration: habit.doneToday
            ? "line-through"
            : "none"
        }
      });

      habit.linkedGoals.forEach(goalId => {

        newEdges.push({
          id: `e-${goalId}-${id}`,
          source: `goal-${goalId}`,
          target: id
        });

      });

    });

    setNodes(newNodes);
    setEdges(newEdges);

    setInitialized(true);
  }


  /* ===============================
     Save Layout
  ================================ */

  useEffect(() => {

    if (!nodes.length) return;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ nodes, edges })
    );

  }, [nodes, edges]);

  /* ===============================
     Filter View
  ================================ */

  const filteredNodes = useMemo(() => {

    return nodes.filter(node => {

      if (node.id === "center") return true;

      if (node.id.startsWith("goal-")) {

        const id =
          node.id.replace("goal-", "");

        return !hiddenGoals.includes(id);
      }

      if (node.id.startsWith("task-")) {

        const edge =
          edges.find(e => e.target === node.id);

        if (!edge) return true;

        const g =
          edge.source.replace("goal-", "");

        return !hiddenGoals.includes(g);
      }

      if (node.id.startsWith("category-")) {

        const edge =
          edges.find(e => e.target === node.id);

        if (!edge) return true;

        const g =
          edge.source.replace("goal-", "");

        return !hiddenGoals.includes(g);
      }
      if (node.id.startsWith("habit-")) {

        const links =
          edges.filter(e => e.target === node.id);

        return links.some(e => {

          const g =
            e.source.replace("goal-", "");

          return !hiddenGoals.includes(g);
        });
      }

      return true;

    });

  }, [nodes, edges, hiddenGoals]);


  const filteredEdges = useMemo(() => {

    return edges.filter(edge => {

      const sourceOk =
        filteredNodes.some(n => n.id === edge.source);

      const targetOk =
        filteredNodes.some(n => n.id === edge.target);

      return sourceOk && targetOk;

    });

  }, [edges, filteredNodes]);

  /* ===============================
     Download
  ================================ */

  async function handleDownload() {

    if (!wrapperRef.current) return;

    try {

      const dataUrl = await toPng(
        wrapperRef.current,
        {
          backgroundColor: "#050505",
          pixelRatio: 2,
          cacheBust: true
        }
      );

      const link = document.createElement("a");

      link.href = dataUrl;
      link.download = "chronomind.png";
      link.click();

    } catch (err) {
      console.error(err);
    }
  }

async function handleDeleteNode(node) {

  if (!node) return;

  if (node.id === "center") return;

  const id = node.id;

  try {

    /* ========== META ========== */
    if (id.startsWith("goal-")) {

      const realId = id.replace("goal-", "");

      await GoalServices.remove(realId);
    }


    /* ========== TASK ========== */
    if (id.startsWith("task-")) {

      const realId = id.replace("task-", "");

      await TasksService.remove(realId);
    }


    /* ========== HABIT ========== */
    if (id.startsWith("habit-")) {

      const realId = id.replace("habit-", "");

      await HabitService.remove(realId);
    }


/* ========== CATEGORY ========== */
if (id.startsWith("category-")) {

  const realId = id.replace("category-", "");

  // pega do localStorage
  const list = getCategories();

  // remove a categoria
  const filtered = list.filter(cat =>
    String(cat.id) !== String(realId)
  );

  // salva de volta
  saveCategories(filtered);

  toast.success("Categoria removida!");

  reload?.();
}


    /* ========== UI ========== */

    setNodes(n => n.filter(nod => nod.id !== id));

    setEdges(e =>
      e.filter(ed =>
        ed.source !== id &&
        ed.target !== id
      )
    );

    setSelectedNode(null);

    toast.success("Item removido!");

  } catch (err) {

    console.error("Erro ao apagar:", err);

    toast.error("Erro ao excluir");
  }
}



  /* ===============================
     Toggle Goal
  ================================ */

  function toggleGoal(id) {

    let updated;

    if (hiddenGoals.includes(id)) {

      updated =
        hiddenGoals.filter(g => g !== id);

    } else {

      updated = [...hiddenGoals, id];

    }

    setHiddenGoals(updated);

    localStorage.setItem(
      HIDDEN_KEY,
      JSON.stringify(updated)
    );
  }

  /* ===============================
     Connect
  ================================ */

  const onConnect = useCallback(
    params =>
      setEdges(eds =>
        addEdge(params, eds)
      ),
    []
  );

  /* ===============================
     Render
  ================================ */

  return (

    <div className="mindmap-canvas">

      {/* Painel Metas */}
      <div
        className={`goal-panel ${panelClosed ? "closed" : ""}`}
      >

        <button
          className="toggle-goals"
          onClick={() =>
            setPanelClosed(!panelClosed)
          }
        >
          {panelClosed ? "Metas" : "Ocultar"}
        </button>

        <div className="goal-filter">

          {goals.map(goal => (

            <label
              key={goal._id}
              className="goal-item"
            >

              <input
                type="checkbox"
                checked={
                  !hiddenGoals.includes(goal._id)
                }
                onChange={() =>
                  toggleGoal(goal._id)
                }
              />

              {goal.title}

            </label>

          ))}

        </div>

      </div>

      {/* Toolbar */}
      <div className="mindmap-toolbar">

        {selectedNode && selectedNode.id !== "center" && (

          <button
            className="delete-btn"
            onClick={() => {
              setNodeToDelete(selectedNode);
              setIsDeleteOpen(true);
            }}
          >
            <FiTrash2 size={18} />
            <span>Deletar</span>
          </button>

        )}

        <button
          className="download-btn"
          onClick={handleDownload}
        >
          📥 Baixar
        </button>

      </div>

      {/* Canvas */}
      <div
        className="mindmap-flow-wrapper"
        ref={wrapperRef}
      >

        <ReactFlow
          nodes={filteredNodes}
          edges={filteredEdges}

          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}

          onSelectionChange={({ nodes }) => {
            setSelectedNode(nodes[0] || null);
          }}


          selectNodesOnDrag={false}
          nodesDraggable
          nodesConnectable={false}
          elementsSelectable

          fitView
        >

          <MiniMap />
          <Controls />
          <Background />

        </ReactFlow>

      </div>


{/* DELETE CONFIRM MODAL */}
{isDeleteOpen && (
  <div className="modal">

    <div className="modal-content small">

      <h3>Excluir Item</h3>

      <p>
        Tem certeza que deseja excluir{" "}
        <b>{nodeToDelete?.data?.label?.split("\n")[0]}</b>?
      </p>

      <div className="modal-footer">

        <button
          className="btn"
          onClick={() => {
            setIsDeleteOpen(false);
            setNodeToDelete(null);
          }}
        >
          Cancelar
        </button>

        <button
          className="btn danger"
          onClick={async () => {

            await handleDeleteNode(nodeToDelete);

            setIsDeleteOpen(false);

            setNodeToDelete(null);
          }}
        >
          Excluir
        </button>

      </div>

    </div>

  </div>
)}
    </div>
  );
}



const base = {
  padding: 12,
  borderRadius: 14,
  color: "#fff",
  border: "1px solid #333",
  width: 180,
  textAlign: "center",
  fontSize: 13,
  boxShadow: "0 0 10px rgba(0,0,0,0.4)"
};

const centerStyle = {
  ...base,
  background: "#d40000",
  fontWeight: "bold"
};

const goalStyle = {
  ...base,
  background: "#111",
  border: "2px solid #ff3030"
};

const categoryStyle = {
  ...base,
  background: "linear-gradient(135deg, #0c1620, #081018)",
  border: "2px solid #4fc3f7",
  boxShadow: "0 0 12px rgba(79,195,247,0.35)",
  color: "#e0f2ff",
  fontWeight: "500"
};

const taskStyle = {
  ...base,
  background: "#0e0e0e",
  border: "2px solid orange"
};

const habitStyle = {
  ...base,
  background: "#071a13",
  border: "2px solid #00ff9c"
};

