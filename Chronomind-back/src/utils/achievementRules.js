export function checkAchievements(data) {

  const {
    tasksCompleted,
    habitStreak,
    goalsCompleted,
    studyHours
  } = data


  const achievements = [

    /* ===== TAREFAS ===== */

    {
      id: "first_task",
      title: "Primeira Vitória",
      description: "Complete sua primeira tarefa",
      type: "tasks",

      progress: tasksCompleted,
      goal: 1,

      unlocked: tasksCompleted >= 1,

      hint: "Conclua pelo menos 1 tarefa"
    },


    {
      id: "task_50",
      title: "Executor",
      description: "Complete 50 tarefas",
      type: "tasks",

      progress: tasksCompleted,
      goal: 50,

      unlocked: tasksCompleted >= 50,

      hint: "Complete 50 tarefas no sistema"
    },


    /* ===== HÁBITOS ===== */

    {
      id: "streak7",
      title: "Fogo Interior",
      description: "Mantenha um hábito por 7 dias",
      type: "streak",

      progress: habitStreak,
      goal: 7,

      unlocked: habitStreak >= 7,

      hint: "Tenha um streak de 7 dias"
    },


    {
      id: "streak30",
      title: "Imparável",
      description: "Streak de 30 dias",
      type: "streak",

      progress: habitStreak,
      goal: 30,

      unlocked: habitStreak >= 30,

      hint: "Mantenha um hábito por 30 dias"
    },


    /* ===== METAS ===== */

    {
      id: "goals5",
      title: "Meta Master",
      description: "Complete 5 metas",
      type: "goals",

      progress: goalsCompleted,
      goal: 5,

      unlocked: goalsCompleted >= 5,

      hint: "Conclua 5 metas"
    },


    {
      id: "goals20",
      title: "Arquiteto de Sonhos",
      description: "Complete 20 metas",
      type: "goals",

      progress: goalsCompleted,
      goal: 20,

      unlocked: goalsCompleted >= 20,

      hint: "Conclua 20 metas no total"
    },


    /* ===== ESTUDO ===== */

    {
      id: "study10",
      title: "Estudante Dedicado",
      description: "Estude por 10 horas",
      type: "study",

      progress: studyHours,
      goal: 10,

      unlocked: studyHours >= 10,

      hint: "Acumule 10 horas de foco"
    },


    {
      id: "study100",
      title: "Mestre do Foco",
      description: "Estude por 100 horas",
      type: "study",

      progress: studyHours,
      goal: 100,

      unlocked: studyHours >= 100,

      hint: "Acumule 100 horas de estudo"
    },


    /* ===== MASTER ===== */

    {
      id: "master_all",
      title: "Lendário",
      description: "Domine todas as áreas",
      type: "master",

      progress:
        Math.min(
          tasksCompleted +
          habitStreak +
          goalsCompleted +
          studyHours,
          200
        ),

      goal: 200,

      unlocked:
        tasksCompleted >= 50 &&
        habitStreak >= 30 &&
        goalsCompleted >= 10 &&
        studyHours >= 100,

      hint: "Seja consistente em todas as áreas"
    }

  ]


  return achievements
}
