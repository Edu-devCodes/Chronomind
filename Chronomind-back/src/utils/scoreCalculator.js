export default function calculateScore(data) {

  const {
    tasksCompleted = 0,
    habitStreak = 0,
    goalsCompleted = 0,
    studyHours = 0
  } = data;


  let score = 0;

  // Tasks
  score += tasksCompleted * 10;

  // Hábitos
  score += habitStreak * 5;

  // Metas
  score += goalsCompleted * 20;

  // Estudo (horas)
  score += studyHours * 15;


  return score;
}
