import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dayjs from "dayjs";
import User from "../models/User.js";
import VerificationToken from "../models/VerificationToken .js"; // <-- CORRIGIDO
import generateCode from "../utils/generateCode.js";
import sendEmail from "../utils/sendEmail.js";


export async function sendVerificationCodeToEmail({ email }) {
  const normalizedEmail = String(email).trim().toLowerCase();

  const existing = await User.findOne({ email: normalizedEmail });

  if (existing && existing.isVerified) {
    throw new Error("Conta já existe. Faça login ou recupere a senha.");
  }

  // gerar código
  const code = generateCode();
  const expiresAt = dayjs().add(10, "minute").toDate();

  // limpar tokens antigos do mesmo email
  await VerificationToken.deleteMany({ email: normalizedEmail });

  // criar o token
  const vt = await VerificationToken.create({
    email: normalizedEmail,           // <-- CORRIGIDO (OBRIGATÓRIO)
    user: existing ? existing._id : null,
    code,
    expiresAt,
  });

  // enviar email
  await sendEmail(normalizedEmail, "Código de verificação ChronoMind", code);

  return { message: "Código enviado", expiresAt };
}


export async function registerWithCode({ email, senha, code }) {
  const normalizedEmail = String(email).trim().toLowerCase();

  const token = await VerificationToken.findOne({ email: normalizedEmail, code })
    .sort({ createdAt: -1 });

  if (!token) throw new Error("Código inválido");

  if (token.expiresAt < new Date()) {
    await token.deleteOne();
    throw new Error("Código expirado");
  }

  const exists = await User.findOne({ email: normalizedEmail });
  if (exists) throw new Error("Email já cadastrado");

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(senha, salt);

  const user = await User.create({
    email: normalizedEmail,
    passwordHash,
    isVerified: true,
  });

  await token.deleteOne();

  return user;
}


export async function loginService({ email, senha }) {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Credenciais inválidas");

  const validPass = await bcrypt.compare(senha, user.passwordHash);
  if (!validPass) throw new Error("Credenciais inválidas");

  // Gerar tokens
  const accessToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_DAYS + "d" }
  );

  // Salvar refresh token no banco
  user.refreshToken = refreshToken;
  await user.save();

  return { user, accessToken, refreshToken };
}



