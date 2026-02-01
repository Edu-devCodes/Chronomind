export default function PomodoroControls({
  running,
  onStart,
  onPause,
  onReset
}) {
  return (
    <div className="pomodoro-actions">
      {!running ? (
        <button className="start-btn" onClick={onStart}>
          ▶ Iniciar
        </button>
      ) : (
        <button className="pause-btn" onClick={onPause}>
          ⏸ Pausar
        </button>
      )}

      <button className="reset-btn" onClick={onReset}>
        ⟳
      </button>
    </div>
  );
}
