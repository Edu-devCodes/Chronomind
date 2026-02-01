import * as authService from "../services/authService.js";
import { getSession } from "../services/sessionService.js";
import User from "../models/User.js";


/* ================= SEND CODE ================= */

export async function sendCode(req, res) {
  try {

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email é obrigatório" });
    }

    await authService.sendVerificationCodeToEmail({ email });

    return res.json({
      message: "Se o e-mail existir, um código foi enviado."
    });

  } catch (err) {
    return res.status(400).json({
      error: err.message || "Erro ao enviar código"
    });
  }
}


/* ================= REGISTER ================= */

export async function register(req, res) {
  try {

    const { email, senha, code } = req.body;

    if (!email || !senha || !code) {
      return res.status(400).json({
        error: "Email, senha e código são obrigatórios"
      });
    }

    const user = await authService.registerWithCode({
      email,
      senha,
      code
    });

    return res.status(201).json({
      message: "Conta criada",
      user: {
        _id: user._id,
        email: user.email
      }
    });

  } catch (err) {
    return res.status(400).json({
      error: err.message || "Erro no registro"
    });
  }
}

/* ================= LOGIN ================= */

export async function loginController(req, res) {
  try {

    const { user, accessToken, refreshToken } =
      await authService.loginService(req.body);


    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "none", // lax em produçao
      secure: true,  // para samesite none
      maxAge: 15 * 60 * 1000
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 30 * 24 * 60 * 60 * 1000
    });


    return res.json({
      message: "Login OK",
      user: {
        _id: user._id,
        email: user.email
      }
    });

  } catch (err) {
    return res.status(400).json({
      error: err.message
    });
  }
}


/* ================= ME ================= */

export async function me(req, res) {
  try {

    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    const session = await getSession(
      accessToken,
      refreshToken,
      res
    );

    return res.json({ user: session.user });

  } catch (err) {

    return res.status(401).json({
      error: err.message || "Sessão inválida"
    });

  }
}

/* ================= ME UPDATE DE DADOS DO PERFIL ================= */

export async function updateMe(req, res) {
  try {

    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    const session = await getSession(
      accessToken,
      refreshToken,
      res
    );

    const userId = session.user._id;

    const { name, bio, avatar } = req.body;


    const user = await User.findByIdAndUpdate(
      userId,
      {
        name,
        bio,
        avatar
      },
      { new: true }
    ).select("-passwordHash -refreshToken");


    return res.json({
      user
    });

  } catch (err) {

    return res.status(401).json({
      error: err.message || "Erro ao atualizar perfil"
    });

  }
}

/* ================= LOGOUT ================= */

export async function logout(req, res) {
  try {

    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      await User.updateOne(
        { refreshToken },
        { $unset: { refreshToken: 1 } }
      );
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.json({ message: "Logout OK" });

  } catch (err) {

    return res.status(500).json({
      error: "Erro no logout"
    });

  }
}
