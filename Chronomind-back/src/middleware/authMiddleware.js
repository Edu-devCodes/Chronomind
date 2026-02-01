import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function authMiddleware(req, res, next) {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (err) {
      return res.status(401).json({ error: "Token inválido ou expirado" });
    }

    const user = await User.findById(decoded.userId).select("-passwordHash -refreshToken");

    if (!user) {
      return res.status(401).json({ error: "Usuário não encontrado" });
    }

    req.user = user;
    next();

  } catch (err) {
    return res.status(500).json({ error: "Erro no middleware de autenticação" });
  }
}
