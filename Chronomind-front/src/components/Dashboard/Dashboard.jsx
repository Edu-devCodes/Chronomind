import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "./Sidebar/Sidebar"
import "./dashboard.css"
import Loading from "../../Loading/Loading"
import Achievements from "./Achievements"

import {
  getDashboardStats,
  getChartsStats
} from "../../services/statsService"

import {
  FaTasks,
  FaBullseye,
  FaFire,
  FaChartLine
} from "react-icons/fa"


import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts"



export default function Dashboard({ onNavigate }) {

  const navigate = useNavigate()

  const [data, setData] = useState(null)
  const [chart, setChart] = useState([])


  useEffect(() => {

    async function load() {

      try {

        const res = await getDashboardStats()
        const charts = await getChartsStats()

        setData(res)
        setChart(charts.pomodorosPerDay || [])

      } catch (err) {

        console.error("Erro dashboard:", err)

      }

    }

    load()

  }, [])


if (!data) {
  return <Loading text="Carregando dashboard..." />
}


const shortcuts = [

  {
    id: "tasks",
    title: "Tarefas",
    icon: <FaTasks />,
    count: data.cards.weeklyGrowth + "%",
    route: "/tasks"
  },

  {
    id: "goals",
    title: "Metas",
    icon: <FaBullseye />,
    count: data.cards.completionRate + "%",
    route: "/goals"
  },

  {
    id: "habits",
    title: "Hábitos",
    icon: <FaFire />,
    count: data.cards.activeDays.active,
    route: "/habits"
  },

  {
    id: "charts",
    title: "Consistência",
    icon: <FaChartLine />,
    count: data.cards.consistency + "%",
    route: "/charts"
  }

]

  return (

    <div className="dashboard-layout">

      <Sidebar />


      <main className="dashboard-content">


        {/* HEADER */}
        <header className="dashboard-header">

          <h1>Você está arrasando!</h1>

          <p>
            Continue evoluindo no seu sistema 🚀
          </p>

        </header>


        {/* CARDS + GRÁFICO */}
        <div className="grid-shortcuts">

          {shortcuts.map(card => (

            <div
              key={card.id}
              className="neon-card"
              onClick={() => navigate(card.route)}
            >

              <div className="card-top">

                <div className="card-icon">
                  {card.icon}
                </div>


                {card.count !== null && (
                  <div className="card-badge">
                    {card.count}
                  </div>
                )}

              </div>


              <h3>{card.title}</h3>

              <p>{card.description}</p>

              <div className="card-glow" />

            </div>

          ))}


          {/* GRÁFICO */}
          <div className="db-neon-card">

            <h3>Foco Diário (Pomodoro)</h3>

            {chart.length === 0 ? (

              <p className="db-chart-empty">
                Ainda sem dados
              </p>

            ) : (

              <ResponsiveContainer width="100%" height={260}>

                <LineChart data={chart}>

                  <XAxis dataKey="date" />

                  <YAxis />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#ff0033"
                    strokeWidth={3}
                    dot={false}
                  />

                </LineChart>

              </ResponsiveContainer>

            )}

          </div>


        </div>


        {/* STATUS */}
        <div className="status-box">

          <h2>Status do Sistema</h2>

          <div className="status-grid">

            <div>
              <div className="status-label">SCORE</div>
              <div className="status-number">
                {data.score}
              </div>
            </div>

            <div>
              <div className="status-label">CONCLUSÃO</div>
              <div className="status-number">
                {data.cards.completionRate}%
              </div>
            </div>

            <div>
              <div className="status-label">DIAS ATIVOS</div>
              <div className="status-number">
                {data.cards.activeDays.active}
              </div>
            </div>

            <div>
              <div className="status-label">CONSISTÊNCIA</div>
              <div className="status-number">
                {data.cards.consistency}%
              </div>
            </div>

          </div>

        </div>


        {/* ACHIEVEMENTS */}
        <Achievements list={data.achievements} />


      </main>

    </div>
  )
}
