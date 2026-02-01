import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  /* =========================
     CARREGA USUÁRIO
  ========================= */
  async function loadUser() {
    try {
      if (!import.meta.env.VITE_API_ME) {
        setUser(null);
        return;
      }

      const res = await api.get(import.meta.env.VITE_API_ME);

      setUser(res.data?.user || null);

      console.log("Auth: sessão carregada", res.data);
    } catch (err) {
      console.warn("Auth: erro ao carregar sessão", err);
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  }

  /* =========================
     ATUALIZA PERFIL
  ========================= */
  async function updateProfile(data) {
    try {
      const res = await api.put(
        import.meta.env.VITE_API_UPDATE_PROFILE,
        data
      );

      setUser(res.data.user);

      return res.data;
    } catch (err) {
      console.error("Erro ao atualizar perfil", err);
      throw err;
    }
  }

  /* =========================
     ENVIA CÓDIGO
  ========================= */
  async function sendCode(email) {
    if (!email) throw new Error("Email é obrigatório");

    await api.post(import.meta.env.VITE_API_SEND_CODE, { email });

    return true;
  }

  /* =========================
     LOGIN
  ========================= */
  async function login(email, senha) {
    const res = await api.post(import.meta.env.VITE_API_LOGIN, {
      email,
      senha
    });

    setUser(res.data.user);

    return res.data;
  }

  /* =========================
     REGISTER
  ========================= */
  async function register(payload) {
    return api.post(import.meta.env.VITE_API_REGISTER, payload);
  }

  /* =========================
     LOGOUT
  ========================= */
  async function logout() {
    await api.post(import.meta.env.VITE_API_LOGOUT);

    setUser(null);
  }

  /* =========================
     INIT
  ========================= */
  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loadingUser,
        login,
        register,
        logout,
        sendCode,
        updateProfile,
        loadUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
