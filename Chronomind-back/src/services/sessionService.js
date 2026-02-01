import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function getSession(accessToken, refreshToken, res) {

  if (!refreshToken) {
    throw new Error("Não autenticado");
  }

  /* =========================
     1. TENTA ACCESS TOKEN
  ========================= */
  try {

    const decoded = jwt.verify(
      accessToken,
      process.env.JWT_ACCESS_SECRET
    );

    const user = await User.findById(decoded.userId)
      .select("-passwordHash -refreshToken");

    if (!user) throw new Error("Usuário não encontrado");

    return { user };

  } catch (err) {
    // expirou → segue pro refresh
  }


  /* =========================
     2. VALIDA REFRESH TOKEN
  ========================= */
  let decodedRefresh;

  try {

    decodedRefresh = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

  } catch {
    throw new Error("Refresh token inválido");
  }


  const user = await User.findById(decodedRefresh.userId);

  if (!user) throw new Error("Usuário não encontrado");

  if (user.refreshToken !== refreshToken) {
    throw new Error("Refresh token inválido");
  }


  /* =========================
     3. GERA NOVO ACCESS
  ========================= */
  const newAccess = jwt.sign(
    { userId: user._id },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" }
  );


  res.cookie("accessToken", newAccess, {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    maxAge: 15 * 60 * 1000
  });


return {
  user: {
    _id: user._id,
    email: user.email,
    name: user.name,
    bio: user.bio,
    avatar: user.avatar
  }
};
}
