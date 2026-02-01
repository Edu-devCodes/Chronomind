import StatsService from "../services/statsService.js";

import calculateScore from "../utils/scoreCalculator.js";
import { checkAchievements } from "../utils/achievementRules.js";


export async function getDatadashboard(req, res) {

  try {

    const userId = req.user.id;


    // Base data
    const base =
      await StatsService.getBaseStats(userId);


    // Score
    const score =
      calculateScore(base);


    // Achievements
    const achievements =
      checkAchievements(base);


    res.json({

      cards: {
        weeklyGrowth: base.weeklyGrowth,
        completionRate: base.completionRate,
        activeDays: base.activeDays,
        consistency: base.consistency
      },

      score,
      achievements
    });

  } catch (err) {

    console.error("Dashboard error:", err);

    res.status(500).json({
      message: "Erro no dashboard"
    });
  }
}
