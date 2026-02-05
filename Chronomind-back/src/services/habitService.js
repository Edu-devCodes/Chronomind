import Habit from "../models/Habit.js";
import Goal from "../models/Goal.js";



/* ===============================
   HELPERS
================================ */

function normalizeDate(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}


function sameDay(a, b) {
  return a.getTime() === b.getTime();
}


function getWeekStart(date) {
  const d = new Date(date);
  d.setHours(0,0,0,0);

  const day = d.getDay(); // 0 domingo
  d.setDate(d.getDate() - day);

  return d;
}


/* ===============================
   FORMATADOR PRINCIPAL
================================ */

function formatHabit(habit) {

  const today = normalizeDate(new Date());


  /* ===== NORMALIZA DATAS ===== */
  const dates = habit.completedDates
    .map(normalizeDate)
    .sort((a,b) => b - a);


  /* ===== DONE TODAY ===== */
  const doneToday =
    dates.length &&
    sameDay(dates[0], today);


  /* ===== STREAK REAL ===== */
  let streak = 0;

  let cursor = new Date(today);

  for (const d of dates) {

    if (sameDay(d, cursor)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }


  /* ===== SEMANA ATUAL ===== */

  const weekStart = getWeekStart(today);

  const week = Array(7).fill(false);

  dates.forEach(d => {

    if (d >= weekStart && d <= today) {

      const i = d.getDay();
      week[i] = true;
    }
  });


  return {
    ...habit.toObject(),

    doneToday,
    streak,
    week
  };
}


/* ===============================
   SERVICE
================================ */

const HabitService = {

  /* ===== LISTAR ===== */
  async listByUser(userId) {

    const habits = await Habit
      .find({ userId })
      .sort({ createdAt: -1 });

    return habits.map(formatHabit);
  },


  /* ===== CRIAR ===== */
async create(data) {

  const habit = await Habit.create({
    ...data,
    completedDates: []
  });

  /* ===============================
     CRIA CHECKPOINT NAS METAS
  ============================== */

  if (data.linkedGoals?.length) {

    for (const goalId of data.linkedGoals) {

      const goal = await Goal.findById(goalId);

      if (!goal) continue;

      goal.checkpoints.push({
        id: habit._id.toString(),
        title: habit.name,
        completed: false
      });

      await goal.save();
    }
  }

  return formatHabit(habit);
},



  /* ===== UPDATE ===== */
  async update(habitId, userId, data) {

    const habit = await Habit.findOneAndUpdate(
      { _id: habitId, userId },
      {
        name: data.name,
        icon: data.icon,
        color: data.color
      },
      { new: true }
    );

    if (!habit) return null;

    return formatHabit(habit);
  },


  /* ===== TOGGLE HOJE ===== */
async toggleToday(habitId, userId) {

  const habit = await Habit.findOne({
    _id: habitId,
    userId
  });

  if (!habit) return null;

  const today = normalizeDate(new Date());

  const index = habit.completedDates.findIndex(d =>
    sameDay(normalizeDate(d), today)
  );

  let markedToday = false;


  /* ===== REMOVE ===== */
  if (index >= 0) {

    habit.completedDates.splice(index, 1);

  } 
  /* ===== ADD ===== */
  else {

    habit.completedDates.push(today);
    markedToday = true;

  }

  await habit.save();


  /* ===============================
     ATUALIZA METAS LIGADAS
  ============================== */

if (habit.linkedGoals?.length) {

  for (const goalId of habit.linkedGoals) {

    const goal = await Goal.findOne({
      _id: goalId,
      userId
    });

    if (!goal) continue;

    // procura checkpoint do hábito
    let checkpoint = goal.checkpoints.find(
      c => c.id === habit._id.toString()
    );

    // se não existir, cria
    if (!checkpoint) {

      goal.checkpoints.push({
        id: habit._id.toString(),
        title: habit.name,
        completed: markedToday
      });

    } else {

      checkpoint.completed = markedToday;

    }

    // recalcula progresso
    const done =
      goal.checkpoints.filter(c => c.completed).length;

    goal.progress =
      (done / goal.checkpoints.length) * 100;

    await goal.save();
  }
}


  return formatHabit(habit);
},



  /* ===== REMOVER ===== */
  async remove(habitId, userId) {

    return Habit.findOneAndDelete({
      _id: habitId,
      userId
    });
  }
};

export default HabitService;
