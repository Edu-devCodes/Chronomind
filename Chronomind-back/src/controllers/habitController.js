import HabitService from "../services/habitService.js";

export const listHabits = async (req, res) => {
  try {
    const habits = await HabitService.listByUser(req.user._id);
    res.json(habits);
  } catch (err) {
    res.status(500).json({ error: "Erro ao listar hábitos" });
  }
};

export const createHabit = async (req, res) => {
  try {
    const habit = await HabitService.create({
      ...req.body,
      userId: req.user._id
    });

    res.status(201).json(habit);
  } catch (err) {
    res.status(400).json({ error: "Erro ao criar hábito" });
  }
};

export const updateHabit = async (req, res) => {
  try {
    const habit = await HabitService.update(
      req.params.id,
      req.user._id,
      req.body
    );

    if (!habit) {
      return res.status(404).json({ error: "Hábito não encontrado" });
    }

    res.json(habit);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar hábito" });
  }
};

export const toggleHabit = async (req, res) => {
  try {
    const habit = await HabitService.toggleToday(
      req.params.id,
      req.user._id
    );

    if (!habit) {
      return res.status(404).json({ error: "Hábito não encontrado" });
    }

    res.json(habit);
  } catch (err) {
    res.status(500).json({ error: "Erro ao atualizar hábito" });
  }
};

export const deleteHabit = async (req, res) => {
  try {
    const deleted = await HabitService.remove(
      req.params.id,
      req.user._id
    );

    if (!deleted) {
      return res.status(404).json({ error: "Hábito não encontrado" });
    }

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Erro ao remover hábito" });
  }
};
