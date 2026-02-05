import { useEffect, useState } from "react";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

import { getChartsStats } from "../../services/statsService";

import "./charts.css";

const COLORS = ["#ff2d2d", "#6ee7ff", "#22c55e", "#facc15"];

export default function DashboardCharts() {

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);


  useEffect(() => {
    load();
  }, []);


  async function load() {

    try {

      const res = await getChartsStats();


      setData(res);

    } catch (err) {

      console.error("Erro charts:", err);

      setError(true);

    } finally {

      setLoading(false);
    }
  }


  /* ===============================
      STATES
  =============================== */

  if (loading) {
    return <p className="charts-loading">Carregando...</p>;
  }

  if (error) {
    return <p className="charts-loading">Erro ao carregar dados</p>;
  }

  if (!data) {
    return <p className="charts-loading">Sem dados</p>;
  }


  /* ===============================
      DATA
  =============================== */

  const {

    weeklyGrowth = 0,
    completionRate = 0,
    activeDays = { active: 0, total: 0 },
    consistency = 0,

    pomodorosPerDay = [],
    tasks = [],
    habits = [],
    goals = [],
    overallProgress

  } = data;


// Função utilitária para formatar minutos em "Xh Ym"
// Função utilitária
function formatMinutesToHM(minutes) {
  minutes = Math.round(minutes); // garante inteiro
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}
  return (

    <div className="charts-wrapper">


      {/* ================= CARDS ================= */}

      <div className="stats-cards">

        <div className="stat-card">
          <h4>Crescimento Semanal</h4>
          <strong>
            {weeklyGrowth >= 0 ? "+" : ""}
            {weeklyGrowth}%
          </strong>
          <span>vs semana passada 📊</span>
        </div>


        <div className="stat-card">
          <h4>Consistência</h4>
          <strong>{consistency}%</strong>
          <span>Dias produtivos 📅</span>
        </div>


        <div className="stat-card">
          <h4>Dias Ativos</h4>
          <strong>
            {activeDays.active}/{activeDays.total}
          </strong>
          <span>Presença 🔥</span>
        </div>


        <div className="stat-card">
          <h4>Taxa de Conclusão</h4>
          <strong>{completionRate}%</strong>
          <span>Produtividade geral ⚡</span>
        </div>

      </div>


      {/* ================= GRID ================= */}

      <div className="charts-grid">


        {/* Foco diário */}
        <div className="chart-card">

          <h3>📈 Foco Diário</h3>

          <ResponsiveContainer width="100%" height={260}>

            <LineChart data={pomodorosPerDay}>

              {/* Eixo X: datas */}
              <XAxis dataKey="date" />

              {/* Eixo Y: minutos */}
<YAxis tickFormatter={formatMinutesToHM} />

<Tooltip 
  formatter={(value) => formatMinutesToHM(value)} 
  labelFormatter={(label) => `Dia: ${label}`}
/>

              {/* Linha de total de minutos por dia */}
              <Line
                dataKey="total"
                stroke="#ff2d2d"
                strokeWidth={3}
                dot={false}
              />

            </LineChart>

          </ResponsiveContainer>

        </div>


        {/* Tasks */}
        <div className="chart-card">

          <h3>🎯 Tasks</h3>

          <ResponsiveContainer width="100%" height={260}>

            <BarChart data={tasks}>

              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />

              <Tooltip />

              <Bar dataKey="value" fill="#ff2d2d" />

            </BarChart>

          </ResponsiveContainer>

        </div>


        {/* Hábitos */}
        <div className="chart-card">

          <h3>🔥 Hábitos</h3>

          <ResponsiveContainer width="100%" height={260}>

            <PieChart>

              <Pie
                data={habits}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={85}
              >

                {habits.map((_, i) => (
                  <Cell
                    key={i}
                    fill={COLORS[i % COLORS.length]}
                  />
                ))}

              </Pie>

              <Tooltip />

            </PieChart>

          </ResponsiveContainer>

        </div>


        {/* Metas */}
        <div className="chart-card">

          <h3>🎯 Metas</h3>

          <ResponsiveContainer width="100%" height={260}>

            <BarChart
              data={goals}
              layout="vertical"
            >

              <XAxis
                type="number"
                domain={[0, 100]}
              />

              <YAxis
                dataKey="name"
                type="category"
                width={120}
              />

              <Tooltip />

              <Bar
                dataKey="progress"
                fill="#6ee7ff"
              />

            </BarChart>

          </ResponsiveContainer>

        </div>


      </div>



      {/* ================= BIG ================= */}

      <div className="chart-card big">

        <h3>📊 Evolução Geral (30 dias)</h3>

        <ResponsiveContainer width="100%" height={320}>

          <LineChart data={overallProgress}>

            <XAxis dataKey="date" />

            <YAxis />

            <Tooltip />

            {/* Foco */}
            <Line
              type="monotone"
              dataKey="pomodoros"
              stroke="#ff2d2d"
              strokeWidth={3}
              name="Foco (min)"
            />

            {/* Tasks */}
            <Line
              type="monotone"
              dataKey="tasks"
              stroke="#6ee7ff"
              strokeWidth={2}
              name="Tasks"
            />

            {/* Hábitos */}
            <Line
              type="monotone"
              dataKey="habits"
              stroke="#22c55e"
              strokeWidth={2}
              name="Hábitos"
            />

          </LineChart>

        </ResponsiveContainer>

        <p
          className={
            weeklyGrowth >= 0
              ? "positive"
              : "negative"
          }
        >

          {weeklyGrowth >= 0
            ? "↗ Seu ritmo geral está crescendo 💪"
            : "↘ Vamos recuperar o foco 🔥"}

        </p>

      </div>

    </div>
  );
}
