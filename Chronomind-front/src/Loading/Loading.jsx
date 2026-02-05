import "./Loading.css"

export default function Loading({ text = "Carregando..." }) {
  return (
    <div className="loading-container">

      <div className="clock">

        {/* Círculo */}
        <div className="clock-face" />

        {/* Ponteiro */}
        <div className="clock-hand" />

        {/* Centro */}
        <div className="clock-center" />

      </div>

      <p className="loading-text">
        {text}
      </p>

    </div>
  )
}