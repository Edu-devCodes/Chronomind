import Habit from "../models/Habit.js";
import { startOfDay, isSameDay } from "date-fns";

const formatHabit = (habit) => {
  const today = startOfDay(new Date());

  const completedDates = habit.completedDates.map(d =>
    startOfDay(new Date(d))
  );

  // ✅ feito hoje
  const doneToday = completedDates.some(d =>
    isSameDay(d, today)
  );

  // 🔥 streak
  const sorted = [...completedDates].sort(
    (a, b) => b.getTime() - a.getTime()
  );

  let streak = 0;
  let currentDay = today;

  for (const date of sorted) {
    if (isSameDay(date, currentDay)) {
      streak++;
      currentDay = startOfDay(
        new Date(currentDay.getTime() - 86400000)
      );
    } else {
      break;
    }
  }

  // 📅 semana (Domingo → Sábado)
  const week = Array(7).fill(false);

  completedDates.forEach(date => {
    const dayIndex = date.getDay(); // 0 = Domingo
    week[dayIndex] = true;
  });

  return {
    ...habit.toObject(),
    doneToday,
    streak,
    week // 🔥 AGORA EXISTE
  };
};

const HabitService = {
  listByUser: async (userId) => {
    const habits = await Habit.find({ userId }).sort({ createdAt: -1 });
    return habits.map(formatHabit);
  },

  create: async (data) => {
    const habit = await Habit.create({
      ...data,
      completedDates: []
    });

    return formatHabit(habit);
  },

  toggleToday: async (habitId, userId) => {
    const habit = await Habit.findOne({ _id: habitId, userId });
    if (!habit) return null;

    const today = startOfDay(new Date());

    const index = habit.completedDates.findIndex(d =>
      isSameDay(d, today)
    );

    if (index >= 0) {
      habit.completedDates.splice(index, 1);
    } else {
      habit.completedDates.push(today);
    }

    await habit.save();
    return formatHabit(habit);
  },

  remove: (habitId, userId) => {
    return Habit.findOneAndDelete({ _id: habitId, userId });
  }
};

export default HabitService;
