import { getSession } from "../services/sessionService.js";

export async function me(req, res) {
  try {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    const result = await getSession(accessToken, refreshToken, res);

    return res.json(result);
  } catch (err) {
    return res.status(401).json({ error: err.message });
  }
}
