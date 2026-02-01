import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FiMenu,
  FiX,
  FiClock,
  FiBookOpen
} from "react-icons/fi";

import Sidebar from "../Dashboard/Sidebar/Sidebar";
import PomodoroCard from "./Pomodoro/PomodoroCard";
import TaskSelector from "./Pomodoro/TaskSelector";
import SummaryArea from "./Summaries/SummaryArea";
import TasksService from "../../services/tasksService";
import { toast } from "react-toastify";

import "./Studies.css";

export default function Studies() {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);

  const [pomodoroRunning, setPomodoroRunning] = useState(false);

  // MOBILE
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState("pomodoro");

  useEffect(() => {
    async function loadTasks() {
      try {
        const res = await TasksService.getAll();

        const activeTasks = res.data.filter(
          task => !task.completed
        );

        setTasks(activeTasks);

      } catch (err) {
        console.error(err);
      }
    }

    loadTasks();
  }, []);

  function handleSelectTask(task) {
    if (pomodoroRunning) {
      toast.warning("Pause o pomodoro antes de trocar a task ⏸️🔥");
      return;
    }

    setSelectedTask(task);
  }

  return (
    <div className="dashboard-layout">

      {/* OVERLAY */}
      {mobileMenuOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`sidebar-wrapper ${
          mobileMenuOpen ? "open" : ""
        }`}
      >
        <Sidebar />
      </aside>

      {/* CONTENT */}
      <motion.main
        className="dashboard-content studies-content"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >

        {/* HEADER */}
        <header className="dashboard-header studies-header">

          {/* MOBILE BTN */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>

          <div>
            <h1>
              Centro de <span>Estudos</span>
            </h1>
            <p>
              Potencialize seu aprendizado
            </p>
          </div>

        </header>

        {/* GRID / MOBILE SCREENS */}
        <div className="studies-grid">

          {/* POMODORO */}
          <div
            className={`pomodoro-column ${
              mobileTab === "pomodoro" ? "active" : ""
            }`}
          >

            <TaskSelector
              tasks={tasks}
              selectedTask={selectedTask}
              running={pomodoroRunning}
              onSelect={handleSelectTask}
            />

            <PomodoroCard
              selectedTask={selectedTask}
              onRunningChange={setPomodoroRunning}
            />

          </div>

          {/* SUMMARIES */}
          <div
            className={`summary-column ${
              mobileTab === "summaries" ? "active" : ""
            }`}
          >
            <SummaryArea />
          </div>

        </div>

      </motion.main>

      {/* MOBILE TAB BAR */}
      <nav className="mobile-tab-bar">

        <button
          className={mobileTab === "pomodoro" ? "active" : ""}
          onClick={() => setMobileTab("pomodoro")}
        >
          <FiClock />
          <span>Pomodoro</span>
        </button>

        <button
          className={mobileTab === "summaries" ? "active" : ""}
          onClick={() => setMobileTab("summaries")}
        >
          <FiBookOpen />
          <span>Resumos</span>
        </button>

      </nav>
            
    </div>
  );
}
