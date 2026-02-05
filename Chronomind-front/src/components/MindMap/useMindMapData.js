// src/pages/MindMap/useMindMapData.js

import { useEffect, useState } from "react";
import { cleanUnusedCategories } from "../../utils/categories";
import GoalServices from "../../services/goalsService";
import HabitService from "../../services/habitService";
import TasksService from "../../services/tasksService";

export default function useMindMapData() {
  const [goals, setGoals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  
  async function loadAll() {
    try {
      const [g, t, h] = await Promise.all([
        GoalServices.list(),
        TasksService.getAll(),
        HabitService.list(),
      ]);

      setGoals(g.data);
      cleanUnusedCategories(g.data);
      setTasks(t.data);
      setHabits(h.data);
      console.log(g.data, t.data, h.data);
    } catch (err) {
      console.error("Erro no mapa mental:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  return {
    goals,
    tasks,
    habits,
    loading,
    reload: loadAll
  };
}
