import UserSummary from "../models/UserSummary.js";

export async function getUserSummaries(req, res) {
  try {
    const userId = req.user.id;

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 3, 10); 
    // default = 3 | limite máximo de segurança = 10

    const skip = (page - 1) * limit;

    const onlySaved = req.query.saved === "true";

    const filter = {
      userId,
      ...(onlySaved && { saved: true })
    };

    const userSummaries = await UserSummary.find(filter)
      .sort({ createdAt: -1 }) // 🔥 últimos primeiro
      .skip(skip)
      .limit(limit)
      .populate("summaryId");

    const total = await UserSummary.countDocuments(filter);

    const summaries = userSummaries
      .map(us => us.summaryId)
      .filter(Boolean);

    res.json({
      data: summaries,
      page,
      limit,
      hasMore: skip + summaries.length < total
    });

  } catch (err) {
    console.error("Erro ao buscar resumos:", err.message);
    res.status(500).json({ message: "Erro ao buscar resumos" });
  }
}
