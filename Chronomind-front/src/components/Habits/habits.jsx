import { useEffect, useState } from "react";
import Sidebar from "../Dashboard/Sidebar/Sidebar";
import HabitCard from "./HabitCard";
import HabitModal from "./HabitModal";
import HabitService from "../../services/habitService";
import { FiActivity } from "react-icons/fi";
import { HiOutlineTrophy } from "react-icons/hi2";
import { IoFlashOutline } from "react-icons/io5";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./habits.css";

export default function Habits() {
  const [habits, setHabits] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);

  useEffect(() => {
    HabitService.list().then(res => setHabits(res.data));
  }, []);

  // CREATE
  const createHabit = async (data) => {
    const res = await HabitService.create(data);
    setHabits(prev => [...prev, res.data]);
  };

const emptyMessages = [
  {
    title: "✨ Hábitos em dia!",
    text: "Você não tem nenhum hábito ativo agora. Aproveite esse tempo ou crie um novo hábito."
  },
  {
    title: "🎯 Rotina cumprida",
    text: "Todos os hábitos foram concluídos hoje. Respire fundo — você merece esse descanso."
  },
  {
    title: "🧠 Mente organizada",
    text: "Nenhum hábito pendente por aqui. Um ótimo momento para focar em você mesmo."
  },
  {
    title: "🚀 Produtividade máxima",
    text: "Sua lista de hábitos está vazia. Que tal planejar o próximo hábito a conquistar?"
  },
  {
    title: "☕ Pausa merecida",
    text: "Sem hábitos ativos no momento. Aproveite esse respiro e recarregue suas energias."
  },
  {
    title: "🌙 Dia tranquilo",
    text: "Tudo sob controle na sua rotina. Às vezes, não fazer nada também é progresso."
  }
];


const getRandomEmptyMessage = () => {
  const index = Math.floor(Math.random() * emptyMessages.length);
  return emptyMessages[index];
};


// UPDATE
const updateHabit = async (id, data) => {
  const res = await HabitService.update(id, data);

  setHabits(prev =>
    prev.map(h => (h._id === id ? res.data : h))
  );
};

  // TOGGLE
const toggleDone = async (id) => {

  // 1️⃣ Atualiza na tela na hora
  setHabits((prev) =>
    prev.map((h) =>
      h._id === id
        ? {
            ...h,
            doneToday: !h.doneToday,
            streak: h.doneToday ? h.streak - 1 : h.streak + 1,
          }
        : h
    )
  );

  // 2️⃣ Salva no backend em background
  try {

    await HabitService.toggleToday(id);

  } catch (err) {

    console.error("Erro ao marcar hábito", err);

    toast.error("Erro ao salvar hábito ❌", {
      theme: "dark",
      autoClose: 2000,
    });

    // 3️⃣ Reverte se der erro
    setHabits((prev) =>
      prev.map((h) =>
        h._id === id
          ? {
              ...h,
              doneToday: !h.doneToday,
              streak: h.doneToday ? h.streak - 1 : h.streak + 1,
            }
          : h
      )
    );
  }
};

  
  // DELETE ✅ TOAST
  const deleteHabit = async (id) => {
    await HabitService.remove(id);

    setHabits(prev => prev.filter(h => h._id !== id));

    toast.success("Hábito deletado com sucesso 🗑️", {
      position: "top-right",
      autoClose: 2500,
      theme: "dark",
    });
  };

  const completedToday = habits.filter(h => h.doneToday).length;
  const completionRate = habits.length
    ? Math.round((completedToday / habits.length) * 100)
    : 0;

  const totalDays = Array.from(
    new Set(habits.flatMap(h => h.completedDates || []))
  ).length;

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="habits-page">
        <header className="page-header">
          <h1>Hábitos Diários</h1>
          <p>Construa uma rotina vencedora, um dia de cada vez</p>
        </header>

        {/* STATS */}
        <section className="stats">
          <div className="stat-card">
            <FiActivity />
            <div>
              <strong>{totalDays}</strong>
              <span>Total de Dias</span>
            </div>
          </div>

          <div className="stat-card">
            <HiOutlineTrophy />
            <div>
              <strong>{completedToday}/{habits.length}</strong>
              <span>Completos Hoje</span>
            </div>
          </div>

          <div className="stat-card">
            <IoFlashOutline />
            <div>
              <strong>{completionRate}%</strong>
              <span>Taxa de Conclusão</span>
            </div>
          </div>
        </section>

        <div className="habits-header">
          <h2>Seus Hábitos</h2>
          <button
            className="btn-add"
            onClick={() => {
              setEditingHabit(null);
              setOpenModal(true);
            }}
          >
            + Novo Hábito
          </button>
        </div>

<div className="habits-grid habits-carousel">
  {habits.length > 0 ? (
    habits.map(habit => (
      <HabitCard
        key={habit._id}
        habit={habit}
        onToggle={toggleDone}
        onEdit={(h) => {
          setEditingHabit(h);
          setOpenModal(true);
        }}
        onDelete={deleteHabit}
      />
    ))
  ) : (
    (() => {
      const msg = getRandomEmptyMessage();
      return (
        <div className="empty-habits-message">
          <h3>{msg.title}</h3>
          <p>{msg.text}</p>
        </div>
      );
    })()
  )}
</div>

      </main>

      {openModal && (
        <HabitModal
          habits={habits}
          habit={editingHabit}
          onClose={() => {
            setOpenModal(false);
            setEditingHabit(null);
          }}
          onCreate={createHabit}
          onUpdate={updateHabit}
        />
      )}

      {/* TOAST */}
      <ToastContainer />
    </div>
  );
}
