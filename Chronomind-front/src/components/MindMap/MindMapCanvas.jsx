import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  useMemo
} from "react";

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


import { toPng } from "html-to-image";

import "reactflow/dist/style.css";

/* ===============================
   Constantes
================================ */

const STORAGE_KEY = "chronomind_map_layout";
const TITLE_KEY = "chronomind_title";
const HIDDEN_KEY = "hidden_goals";

/* ===============================
   Componente
================================ */

export default function MindMapCanvas({
  goals,
  tasks,
  habits
}) {

  const wrapperRef = useRef(null);

  /* ===============================
     States
  ================================ */

  const [nodes, setNodes, onNodesChange] =
    useNodesState([]);

  const [edges, setEdges, onEdgesChange] =
    useEdgesState([]);

  const [centerTitle, setCenterTitle] = useState(
    localStorage.getItem(TITLE_KEY) || "🧠 ChronoMind"
  );

  const [hiddenGoals, setHiddenGoals] = useState(
    JSON.parse(localStorage.getItem(HIDDEN_KEY) || "[]")
  );

  const [initialized, setInitialized] =
    useState(false);

  const [panelClosed, setPanelClosed] =
    useState(false);

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
    if (initialized) return;

    buildGraph();

    setInitialized(true);

  }, [goals, tasks, habits]);

  function buildGraph() {

    const newNodes = [];
    const newEdges = [];

    /* Center */

    newNodes.push({
      id: "center",
      position: { x: 400, y: 300 },
      data: { label: centerTitle },
      style: centerStyle
    });

    /* Goals */

    goals.forEach((goal, index) => {

      const id = `goal-${goal._id}`;

      newNodes.push({
        id,
        position: {
          x: 100,
          y: 100 + index * 160
        },
        data: {
          label: `🎯 ${goal.title}`,
          goalId: goal._id
        },
        style: goalStyle
      });

      newEdges.push({
        id: `e-center-${id}`,
        source: "center",
        target: id
      });

    });

    /* Tasks */

    tasks.forEach((task, index) => {

      if (!task.goalId) return;

      const id = `task-${task._id}`;

      newNodes.push({
        id,
        position: {
          x: 550,
          y: 100 + index * 130
        },
        data: {
          label: `✅ ${task.title}`
        },
        style: taskStyle
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
        position: {
          x: 850,
          y: 100 + index * 140
        },
        data: {
          label: `${habit.icon} ${habit.name}`
        },
        style: habitStyle
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

  /* ===============================
     Rename Center
  ================================ */

  function onNodeDoubleClick(_, node) {

    if (node.id !== "center") return;

    const name = prompt(
      "Novo nome:",
      centerTitle
    );

    if (!name?.trim()) return;

    setCenterTitle(name);

    setNodes(nds =>
      nds.map(n =>
        n.id === "center"
          ? {
            ...n,
            data: { label: name }
          }
          : n
      )
    );

    localStorage.setItem(TITLE_KEY, name);
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

          onNodeDoubleClick={onNodeDoubleClick}

          fitView
        >

          <MiniMap />
          <Controls />
          <Background />

        </ReactFlow>

      </div>

    </div>
  );
}

/* ===============================
   Node Styles
================================ */

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
