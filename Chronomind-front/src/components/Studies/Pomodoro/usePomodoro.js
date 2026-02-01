import { useEffect, useState, useRef } from "react";

export function usePomodoro() {
  const FOCUS_TIME = 25 * 60;
  const BREAK_TIME = 5 * 60;

  const [startedAt, setStartedAt] = useState(null);
  const [mode, setMode] = useState("focus");
  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME);
  const [running, setRunning] = useState(false);

  const intervalRef = useRef(null);

  useEffect(() => {
    if (!running) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);

          const nextMode = mode === "focus" ? "break" : "focus";
          setMode(nextMode);
          setRunning(false);
          return nextMode === "focus" ? FOCUS_TIME : BREAK_TIME;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [running, mode]);

  function start() {
    setStartedAt(new Date().toISOString()); // salva início pois tava sem e dando erro no back
    setRunning(true);
  }


  function pause() {
    setRunning(false);
    clearInterval(intervalRef.current);
  }

  function reset() {
    setRunning(false);
    setTimeLeft(mode === "focus" ? FOCUS_TIME : BREAK_TIME);
  }

  function switchMode(newMode) {
    setMode(newMode);
    setRunning(false);
    setTimeLeft(newMode === "focus" ? FOCUS_TIME : BREAK_TIME);
  }

  return {
    mode,
    timeLeft,
    running,
    startedAt,
    start,
    pause,
    reset,
    switchMode,
    progress:
      mode === "focus"
        ? timeLeft / FOCUS_TIME
        : timeLeft / BREAK_TIME
  };
}
