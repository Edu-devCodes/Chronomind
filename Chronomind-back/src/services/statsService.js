import mongoose from "mongoose";

import Task from "../models/Task.js";
import Pomodoro from "../models/PomodoroSession.js";
import Habit from "../models/Habit.js";
import Goal from "../models/Goal.js";

class StatsService {

  /* ===============================
      ENTRY POINT (GRÁFICOS)
  =============================== */

  async getDashboardStats(userId) {

    const uid = new mongoose.Types.ObjectId(userId);

    const [
      pomodorosPerDay,
      tasksStats,
      habitsStats,
      focusByTask,
      overallProgress,

      weeklyGrowth,
      completionRate,
      activeDays,
      consistency,

      goalsStats
    ] = await Promise.all([

      // Charts
      this.pomodorosPerDay(uid),
      this.tasksStats(uid),
      this.habitsStats(uid),
      this.focusByTask(uid),
      this.overallProgress(uid),

      // Cards
      this.weeklyGrowth(uid),
      this.completionRate(uid),
      this.activeDays(uid),
      this.consistency(uid),

      // Goals
      this.goalsStats(uid)
    ]);

    return {

      /* ===== CARDS ===== */
      weeklyGrowth,
      completionRate,
      activeDays,
      consistency,

      /* ===== CHARTS ===== */
      pomodorosPerDay,
      tasks: tasksStats,
      habits: habitsStats,
      focusByTask,
      goals: goalsStats,
      overallProgress
    };
  }


  /* ===============================
      ENTRY POINT (DASHBOARD / SCORE)
  =============================== */

  async getBaseStats(userId) {

    const uid = new mongoose.Types.ObjectId(userId);

    const [

      weeklyGrowth,
      completionRate,
      activeDays,
      consistency,

      tasksCompleted,
      habitStreak,
      goalsCompleted,
      studyHours

    ] = await Promise.all([

      this.weeklyGrowth(uid),
      this.completionRate(uid),
      this.activeDays(uid),
      this.consistency(uid),

      this.tasksCompleted(uid),
      this.bestHabitStreak(uid),
      this.goalsCompleted(uid),
      this.studyHours(uid)
    ]);

    return {

      weeklyGrowth,
      completionRate,
      activeDays,
      consistency,

      tasksCompleted,
      habitStreak,
      goalsCompleted,
      studyHours
    };
  }


  /* ===============================
      GRÁFICOS
  =============================== */

  async pomodorosPerDay(userId) {

    const data = await Pomodoro.aggregate([

      {
        $match: {
          userId,
          type: "focus",
          completed: true
        }
      },

      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$startedAt"
            }
          },
          total: { $sum: "$duration" }
        }
      },

      { $sort: { _id: 1 } }
    ]);

    return data.map(d => ({
      date: d._id,
      total: +(d.total / 60 / 60).toFixed(2) 
    }));
  }


  async tasksStats(userId) {

    const [total, completed] = await Promise.all([

      Task.countDocuments({ userId }),

      Task.countDocuments({
        userId,
        completed: true
      })
    ]);

    if (total === 0) {
      return [
        { name: "Concluídas", value: 0 },
        { name: "Pendentes", value: 0 }
      ];
    }

    const completedPct = Math.round((completed / total) * 100);
    const pendingPct = 100 - completedPct;

    return [
      { name: "Concluídas", value: completedPct },
      { name: "Pendentes", value: pendingPct }
    ];
  }


  async habitsStats(userId) {

    try {

      const habits = await Habit.find({ userId });

      return habits.map(h => ({
        name: h.name,
        value: h.completedDates?.length || 0
      }));

    } catch (err) {

      console.error("HabitsStats error:", err);

      return [];
    }
  }


  async focusByTask(userId) {

    const data = await Pomodoro.aggregate([

      {
        $match: {
          userId,
          type: "focus",
          completed: true,
          taskId: { $ne: null }
        }
      },

      {
        $group: {
          _id: "$taskId",
          total: { $sum: "$duration" }
        }
      }
    ]);

    if (!data.length) return [];

    const tasks = await Task.find({
      _id: { $in: data.map(d => d._id) }
    });

    return data.map(d => {

      const task = tasks.find(
        t => t._id.toString() === d._id.toString()
      );

      return {
        name: task?.title || "Task removida",
        minutes: Math.round(d.total / 60)
      };
    });
  }

  /* ===============================
     EVOLUÇÃO GERAL
  =============================== */

  async overallProgress(userId) {

    const now = new Date();

    // Últimos 30 dias
    const start = new Date();
    start.setDate(now.getDate() - 30);

    /* ================== POMODOROS ================== */

    const pomodoros = await Pomodoro.aggregate([

      {
        $match: {
          userId,
          completed: true,
          type: "focus",
          startedAt: { $gte: start }
        }
      },

      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$startedAt"
            }
          },
          total: { $sum: "$duration" }
        }
      }

    ]);


    /* ================== TASKS ================== */

    const tasks = await Task.aggregate([

      {
        $match: {
          userId,
          completed: true,
          updatedAt: { $gte: start }
        }
      },

      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$updatedAt"
            }
          },
          total: { $sum: 1 }
        }
      }

    ]);


    /* ================== HABITS ================== */

    const habits = await Habit.aggregate([

      {
        $match: {
          userId,
          completedDates: { $exists: true, $ne: [] }
        }
      },

      { $unwind: "$completedDates" },

      {
        $match: {
          completedDates: { $gte: start }
        }
      },

      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$completedDates"
            }
          },
          total: { $sum: 1 }
        }
      }

    ]);


    /* ================== MERGE ================== */

    const map = new Map();


    // Foco (minutos)
    pomodoros.forEach(p => {

      map.set(p._id, {
        date: p._id,
        pomodoros: Math.round(p.total / 60),
        tasks: 0,
        habits: 0
      });

    });


    // Tasks
    tasks.forEach(t => {

      if (!map.has(t._id)) {

        map.set(t._id, {
          date: t._id,
          pomodoros: 0,
          tasks: 0,
          habits: 0
        });

      }

      map.get(t._id).tasks = t.total;

    });


    // Habits
    habits.forEach(h => {

      if (!map.has(h._id)) {

        map.set(h._id, {
          date: h._id,
          pomodoros: 0,
          tasks: 0,
          habits: 0
        });

      }

      map.get(h._id).habits = h.total;

    });


    // Ordenar por data
    return Array.from(map.values())
      .sort((a, b) => a.date.localeCompare(b.date));
  }
  /* ===============================
      METAS
  =============================== */

  async goalsStats(userId) {

    const goals = await Goal.find({
      userId: userId.toString()
    });

    return goals.map(goal => {

      const total = goal.checkpoints.length;

      const completed = goal.checkpoints.filter(
        c => c.completed
      ).length;

      const progress =
        total === 0
          ? goal.progress || 0
          : Math.round((completed / total) * 100);

      let status = "active";

      if (progress === 100) status = "done";
      else if (new Date(goal.deadline) < new Date())
        status = "late";

      return {
        name: goal.title,
        progress,
        status
      };
    });
  }


  /* ===============================
      CARDS
  =============================== */

  async weeklyGrowth(userId) {

    const now = new Date();

    const lastWeek = new Date(now);
    lastWeek.setDate(now.getDate() - 7);

    const prevWeek = new Date(now);
    prevWeek.setDate(now.getDate() - 14);


    const [current, previous] = await Promise.all([

      // Semana atual
      Task.countDocuments({
        userId,
        completed: true,
        updatedAt: { $gte: lastWeek }
      }),

      // Semana anterior
      Task.countDocuments({
        userId,
        completed: true,
        updatedAt: {
          $gte: prevWeek,
          $lt: lastWeek
        }
      })

    ]);


    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }

    return Math.round(
      ((current - previous) / previous) * 100
    );
  }



  async completionRate(userId) {

    const now = new Date();

    const start = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const [total, completed] = await Promise.all([

      Task.countDocuments({
        userId,
        createdAt: { $gte: start }
      }),

      Task.countDocuments({
        userId,
        completed: true,
        createdAt: { $gte: start }
      })
    ]);

    if (total === 0) return 0;

    return Math.round((completed / total) * 100);
  }



  async activeDays(userId) {

    const now = new Date();

    const start = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );


    const [pomodoros, tasks, habits, goals] =
      await Promise.all([

        // Pomodoros
        Pomodoro.aggregate([
          {
            $match: {
              userId,
              completed: true,
              startedAt: { $gte: start }
            }
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$startedAt"
                }
              }
            }
          }
        ]),

        // Tasks
        Task.aggregate([
          {
            $match: {
              userId,
              completed: true,
              updatedAt: { $gte: start }
            }
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$updatedAt"
                }
              }
            }
          }
        ]),

        // Habits
        Habit.aggregate([
          {
            $match: {
              userId,
              completedDates: { $exists: true, $ne: [] }
            }
          },
          {
            $unwind: "$completedDates"
          },
          {
            $match: {
              completedDates: { $gte: start }
            }
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$completedDates"
                }
              }
            }
          }
        ]),

        // Goals
        Goal.aggregate([
          {
            $match: {
              userId,
              updatedAt: { $gte: start }
            }
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$updatedAt"
                }
              }
            }
          }
        ])
      ]);


    const allDays = new Set();

    [...pomodoros, ...tasks, ...habits, ...goals]
      .forEach(d => allDays.add(d._id));


    const totalDays = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    ).getDate();


    return {
      active: allDays.size,
      total: totalDays
    };
  }

  // meio sus essa parte do sistema contar os dias, revisar dps

  async consistency(userId) {

    const now = new Date();

    const start = new Date(now);
    start.setDate(now.getDate() - 30);

    const data = await Pomodoro.aggregate([

      {
        $match: {
          userId,
          completed: true,
          startedAt: { $gte: start }
        }
      },

      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$startedAt"
            }
          }
        }
      }
    ]);

    return Math.round((data.length / 30) * 100);
  }


  /* ===============================
      SCORE / ACHIEVEMENTS
  =============================== */

  async tasksCompleted(userId) {

    return Task.countDocuments({
      userId,
      completed: true
    });
  }


  async bestHabitStreak(userId) {

    const habits = await Habit.find({ userId });

    if (!habits.length) return 0;

    return Math.max(
      ...habits.map(h => h.streak || 0)
    );
  }


  async goalsCompleted(userId) {

    const goals = await Goal.find({ userId });

    return goals.filter(g => {

      const total = g.checkpoints.length;

      if (total === 0) return false;

      const done =
        g.checkpoints.filter(c => c.completed).length;

      return done === total;

    }).length;
  }


  async studyHours(userId) {

    const data = await Pomodoro.aggregate([

      {
        $match: {
          userId,
          completed: true,
          type: "focus"
        }
      },

      {
        $group: {
          _id: null,
          total: { $sum: "$duration" }
        }
      }
    ]);

    if (!data.length) return 0;

    return Math.round(data[0].total / 3600);
  }

}

export default new StatsService();
