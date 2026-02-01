import * as goalService from "../services/goalService.js";

export async function createGoal(req, res) {
  try {
    const goal = await goalService.createGoal(req.user._id, req.body);
    return res.status(201).json(goal);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao criar meta" });
  }
}

export async function getGoals(req, res) {
  try {
    const goals = await goalService.getGoals(req.user._id);
    return res.json(goals);
  } catch {
    return res.status(500).json({ error: "Erro ao obter metas" });
  }
}

export async function updateGoal(req, res) {
  try {
    const updated = await goalService.updateGoal(
      req.user._id,
      req.params.id,
      req.body
    );

    if (!updated) {
      return res.status(404).json({ error: "Meta não encontrada" });
    }

    return res.json(updated);
  } catch {
    return res.status(500).json({ error: "Erro ao atualizar meta" });
  }
}



export async function attCheckpoint(req, res) {

  try {

    const userId = req.user._id;
    const { id } = req.params;

    const { checkpointId, title } = req.body;

    if (!checkpointId || !title) {
      return res.status(400).json({
        error: "Dados inválidos"
      });
    }

    const goal = await goalService.addCheckpoint(
      userId,
      id,
      {
        id: checkpointId,
        title
      }
    );

    res.json(goal);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message
    });

  }
}



export async function deleteGoal(req, res) {
  try {
    const deleted = await goalService.deleteGoal(
      req.user._id,
      req.params.id
    );

    if (!deleted) {
      return res.status(404).json({ error: "Meta não encontrada" });
    }

    return res.json({ success: true });
  } catch {
    return res.status(500).json({ error: "Erro ao deletar meta" });
  }
}
