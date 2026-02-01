import StatsService from "../services/StatsService.js";


export async function getDashboardStats(req, res) {

  try {

    const userId = req.user.id;

    const stats =
      await StatsService.getDashboardStats(userId);

    res.json(stats);

  } catch (err) {

    console.error("Erro analytics:", err);

    res.status(500).json({
      message: "Erro ao gerar estatísticas"
    });
  }
}
