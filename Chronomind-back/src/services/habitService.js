import Habit from "../models/Habit.js";


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


    /* REMOVE */
    if (index >= 0) {

      habit.completedDates.splice(index, 1);

    } 
    /* ADD */
    else {

      habit.completedDates.push(today);
    }


    await habit.save();

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
