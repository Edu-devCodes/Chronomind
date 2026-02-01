import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

import {
  finishPomodoro,
  getTodayPomodoros
} from "../../../services/pomodoroService";

import TasksService from "../../../services/tasksService";

import PomodoroTimer from "./PomodoroTimer";
import PomodoroControls from "./PomodoroControls";

import "./Pomodoro.css";

/* ⏱️ TEMPOS */
const FOCUS_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

const STORAGE_KEY = "activePomodoro";

export default function PomodoroCard({
  selectedTask,
  onRunningChange
}) {

  /* ===============================
     STATE
  =============================== */
  const [mode, setMode] = useState("focus");
  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME);
  const [running, setRunning] = useState(false);
  const [sessionsToday, setSessionsToday] = useState(0);

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  /* ===============================
     REFS
  =============================== */
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const pendingFinishRef = useRef(null);
  const lastFocusTimeRef = useRef(FOCUS_TIME);


  /* ===============================
     DERIVED
  =============================== */
  const totalTime =
    mode === "focus" ? FOCUS_TIME : BREAK_TIME;

  const progress =
    1 - timeLeft / totalTime;


  /* ===============================
     AVISA O PAI
  =============================== */
  useEffect(() => {
    onRunningChange?.(running);
  }, [running]);


  /* ===============================
     LOAD TODAY
  =============================== */
  useEffect(() => {

    async function loadToday() {
      try {
        const count = await getTodayPomodoros();
        setSessionsToday(count);
      } catch {
        toast.error("Erro ao carregar sessões");
      }
    }

    loadToday();

  }, []);


  /* ===============================
     RESTORE
  =============================== */
  useEffect(() => {

    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved || !selectedTask) return;

    try {

      const data = JSON.parse(saved);

      if (data.taskId !== selectedTask._id) return;

      setMode(data.mode);
      setTimeLeft(data.timeLeft);
      setRunning(data.running);

      if (data.startedAt) {
        startTimeRef.current = data.startedAt;
      }

      if (data.lastFocusTime) {
        lastFocusTimeRef.current = data.lastFocusTime;
      }



    } catch {

      localStorage.removeItem(STORAGE_KEY);

    }

  }, [selectedTask]);


  /* ===============================
     TIMER
  =============================== */
  useEffect(() => {

    if (!running) return;

    intervalRef.current = setInterval(() => {

      setTimeLeft(prev => {

        if (prev <= 1) {

          clearInterval(intervalRef.current);

          onTimerEnd();

          return totalTime;
        }

        return prev - 1;

      });

    }, 1000);

    return () => clearInterval(intervalRef.current);

  }, [running, mode]);


  /* ===============================
     AUTOSAVE
  =============================== */
  useEffect(() => {

    if (!running) return;

    const auto = setInterval(() => {
      persistState(running);
    }, 180000);

    return () => clearInterval(auto);

  }, [running]);


  /* ===============================
     TIMER END
  =============================== */
  function onTimerEnd() {

    setRunning(false);

    const startedAt = startTimeRef.current;

    pendingFinishRef.current = {
      taskId: selectedTask?._id || null,
      type: mode,
      startedAt,
      confirmed: false // padrão
    };

    localStorage.removeItem(STORAGE_KEY);

    // FOCO → pergunta
    if (mode === "focus" && selectedTask) {

      setShowConfirmModal(true);
      return;
    }

    // PAUSA → volta pro foco
    if (mode === "break") {

      setMode("focus");

      setTimeLeft(
        lastFocusTimeRef.current || FOCUS_TIME
      );
    }

    finalizePomodoro();
  }



  /* ===============================
     FINALIZE
  =============================== */
  async function finalizePomodoro() {

    const payload = pendingFinishRef.current;

    if (!payload) return;

    try {

      await finishPomodoro(payload);

      if (payload.type === "focus") {

        setSessionsToday(p => p + 1);

        toast.success("Sessão concluída 💪");

      } else {

        toast.info("Pausa finalizada ☕");

      }

      // limpa só após sucesso
      startTimeRef.current = null;

    } catch (err) {

      toast.error("Erro ao salvar sessão");

      console.error(err.response?.data || err);

    } finally {

      pendingFinishRef.current = null;

    }
  }


  /* ===============================
     MODAL
  =============================== */
  async function confirmTaskCompletion() {

    // marca como confirmado
    pendingFinishRef.current.confirmed = true;

    try {

      await TasksService.update(
        selectedTask._id,
        { completed: true }
      );

      toast.success("Tarefa concluída 🔥");

    } catch {

      toast.error("Erro ao concluir task");

    } finally {

      setShowConfirmModal(false);

      finalizePomodoro();
    }
  }



  function cancelTaskCompletion() {

    // NÃO confirma
    pendingFinishRef.current.confirmed = false;

    setShowConfirmModal(false);

    finalizePomodoro();
  }



  /* ===============================
     CONTROLS
  =============================== */
  function start() {

    if (!selectedTask) {

      toast.warning("Selecione uma task 🎯");
      return;
    }

    if (!startTimeRef.current) {

      // ISO padronizado
      startTimeRef.current =
        new Date().toISOString();
    }

    setRunning(true);

    persistState(true);

    toast.success("Pomodoro iniciado 🚀");
  }


  function pause() {

    if (mode === "focus") {
      lastFocusTimeRef.current = timeLeft;
    }

    setRunning(false);

    persistState(false);

    toast.info("Pausado ⏸️");
  }


function reset() {

  setRunning(false);

  setTimeLeft(totalTime);

  startTimeRef.current = null;

  pendingFinishRef.current = null; 
  setShowConfirmModal(false);      

  localStorage.removeItem(STORAGE_KEY);

  toast.info("Resetado 🔄");
}



  /* ===============================
     SWITCH MODE
  =============================== */
  function switchMode(newMode) {

    if (running) {

      toast.warning("Pause antes ⚠️");
      return;
    }

    if (newMode === "break") {

      if (mode === "focus") {
        lastFocusTimeRef.current = timeLeft;
      }

      setMode("break");
      setTimeLeft(BREAK_TIME);

      toast.info("Hora da pausa ☕");
      return;
    }

    if (newMode === "focus") {

      setMode("focus");

      setTimeLeft(
        lastFocusTimeRef.current || FOCUS_TIME
      );

      toast.info("De volta ao foco 🎯");
    }
  }


  /* ===============================
     SAVE STATE
  =============================== */
  function persistState(runningState) {

    if (!selectedTask) return;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        taskId: selectedTask._id,
        mode,
        timeLeft,
        running: runningState,
        startedAt: startTimeRef.current,


        lastFocusTime: lastFocusTimeRef.current
      })
    );
  }



  /* ===============================
     RENDER
  =============================== */
  return (
    <>
      <motion.section
        className="pomodoro-card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >

        {selectedTask && (
          <div className="pomodoro-task">
            <span>🎯 Focando em </span>
            <strong>{selectedTask.title}</strong>
          </div>
        )}

        <div className="pomodoro-modes">

          <button
            className={mode === "focus" ? "active" : ""}
            onClick={() => switchMode("focus")}
          >
            Foco
          </button>

          <button
            className={mode === "break" ? "active" : ""}
            onClick={() => switchMode("break")}
          >
            Pausa
          </button>

        </div>


        <PomodoroTimer
          timeLeft={timeLeft}
          progress={progress}
          mode={mode}
        />


        <PomodoroControls
          running={running}
          onStart={start}
          onPause={pause}
          onReset={reset}
          disabled={!selectedTask}
        />


        <div className="pomodoro-footer">
          <p>Sessões hoje</p>
          <strong>{sessionsToday}</strong>
        </div>

      </motion.section>


      {/* MODAL */}
      <AnimatePresence>
        {showConfirmModal && (

          <motion.div
            className="pomodoro-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >

            <motion.div
              className="pomodoro-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >

              <h2>Pomodoro finalizado 🔥</h2>

              <p>
                Conseguiu concluir?
                <br />
                <strong>
                  {selectedTask?.title}
                </strong>
              </p>

              <div className="modal-actions">

                <button
                  className="btn-cancel"
                  onClick={cancelTaskCompletion}
                >
                  Ainda não
                </button>

                <button
                  className="btn-confirm"
                  onClick={confirmTaskCompletion}
                >
                  Sim, concluí
                </button>

              </div>

            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
