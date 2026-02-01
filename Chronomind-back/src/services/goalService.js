import Goal from "../models/Goal.js";


function calcProgress(checkpoints) {
  if (!checkpoints || checkpoints.length === 0) return 0;

  const completed = checkpoints.filter(c => c.completed).length;

  return (completed / checkpoints.length) * 100;
}


export async function createGoal(userId, data) {

  const progress = calcProgress(data.checkpoints);

  const goal = await Goal.create({
    userId,
    title: data.title,
    description: data.description,
    deadline: data.deadline,
    checkpoints: data.checkpoints,
    progress,
  });

  return goal;
}


export async function getGoals(userId) {
  return Goal.find({ userId }).sort({ createdAt: -1 });
}



export async function updateGoal(userId, goalId, data) {

  const progress = calcProgress(data.checkpoints);

  const updated = await Goal.findOneAndUpdate(
    { _id: goalId, userId },
    {
      ...data,
      progress,
    },
    { new: true }
  );

  return updated;
}



export async function deleteGoal(userId, goalId) {
  return Goal.findOneAndDelete({ _id: goalId, userId });
}



export async function addCheckpoint(userId, goalId, checkpoint) {

  const goal = await Goal.findOne({
    _id: goalId,
    userId
  });

  if (!goal) {
    throw new Error("Meta não encontrada");
  }

  // Evita duplicar
  const exists = goal.checkpoints.find(
    c => c.id === checkpoint.id
  );

  if (exists) {
    return goal;
  }

  goal.checkpoints.push({
    id: checkpoint.id,
    title: checkpoint.title,
    completed: false
  });

  // Recalcula progresso
  goal.progress = calcProgress(goal.checkpoints);

  await goal.save();

  return goal;
}
