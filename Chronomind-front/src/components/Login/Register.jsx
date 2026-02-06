import { useState } from "react";
import { motion } from "framer-motion";

import {
  FaEnvelope,
  FaLock,
  FaPaperPlane,
  FaStar,
  FaBrain,
  FaBullseye,
  FaChartLine,
  FaFire,
  FaEye,
  FaEyeSlash 
} from "react-icons/fa";

import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";

import PageFade from "./LoginAnimation/PageFade";
import "./index.css";

import { Link, useNavigate } from "react-router-dom";

export default function Register() {

  const { register, sendCode } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [code, setCode] = useState("");
  const [timer, setTimer] = useState(0);
  const [redirecting, setRedirecting] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function enviarCode() {

    if (!email) {
      toast.error("Digite seu e-mail primeiro!");
      return;
    }

    if (sendingCode) return;

    setSendingCode(true);

    try {
      await sendCode(email);

      toast.success("Código enviado!");
      setTimer(60);

      const interval = setInterval(() => {
        setTimer(t => {
          if (t <= 1) clearInterval(interval);
          return t - 1;
        });
      }, 1000);

    } catch {
      toast.error("Erro ao enviar código.");
    } finally {
      setSendingCode(false);
    }
  }



  async function handleSubmit(e) {

    e.preventDefault();

    if (senha !== confirmar) {
      toast.error("Senhas não coincidem!");
      return;
    }

    try {

      await register({ email, senha, code });

      toast.success("Conta criada!");

      setRedirecting(true);

      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: { cameFromRegister: true }
        });
      }, 1500);

    } catch {
      toast.error("Erro ao registrar.");
    }
  }


  return (
    <PageFade exit={redirecting}>

      <div className="login-layout">


        {/* ================= LEFT ================= */}
        <div className="login-left">

          <div className="login-brand">

            <div className="brand-icon">
              <FaStar />
            </div>

            <div className="brand-text">
              <h3 className="brand-logo">ChronoMind</h3>
              <span>Domine seu tempo</span>
            </div>

          </div>


          <h1 className="login-title">
            Transforme sua <br />
            <span>produtividade</span>
          </h1>


          <p className="login-desc">
            Gerencie tarefas, construa hábitos e alcance suas metas
            com uma experiência gamificada.
          </p>


          <div className="login-features">

            <Feature icon={<FaBrain />} title="Mapas Mentais" text="Organize ideias" />
            <Feature icon={<FaBullseye />} title="Metas" text="Alcance objetivos" />
            <Feature icon={<FaChartLine />} title="Progresso" text="Acompanhe evolução" />
            <Feature icon={<FaFire />} title="Hábitos" text="Rotinas poderosas" />

          </div>


          <div className="login-left-footer">
            <span>Seguro</span>
            <span>Intuitivo</span>
            <span>Poderoso</span>
          </div>

        </div>



        {/* ================= RIGHT ================= */}
        <motion.div
          className="login-right"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: .6 }}
        >


          {/* Tabs */}
          <div className="login-tabs">

            <Link to="/login">
              Entrar
            </Link>

            <button className="active">
              Criar conta
            </button>

          </div>


          {/* Card */}
          <div className="login-card">

            <h2>Criar conta</h2>

            <p>
              Comece sua jornada agora
            </p>


            <form onSubmit={handleSubmit}>


              {/* Email */}
              <label>Email</label>

              <div className="login-input">

                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />

              </div>


              {/* Password */}
              <label>Senha</label>

              <div className="login-input">

                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Sua senha"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                />

                <span className="show-pass-icon" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </span>

              </div>


              {/* Confirm */}
              <label>Confirmar senha</label>

              <div className="login-input">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirmar senha"
                  value={confirmar}
                  onChange={e => setConfirmar(e.target.value)}
                />

                <span className="show-pass-icon" onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? <FaEyeSlash /> : <FaEye />}
                </span>

              </div>


              {/* Code */}
              <label>Código</label>

              <div className="code-row">

                <div className="login-input" style={{ flex: 1 }}>

                  <input
                    type="text"
                    placeholder="Código"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                  />

                </div>

                <button
                  type="button"
                  className="code-btn"
                  disabled={timer > 0 || sendingCode} // <-- atualize aqui
                  onClick={enviarCode}
                >
                  <FaPaperPlane />
                </button>


              </div>


              <button type="submit" className="login-btn">
                Registrar →
              </button>

            </form>


            <p className="login-footer">

              Já tem conta?{" "}
              <Link to="/login">
                Entrar
              </Link>

            </p>

          </div>

        </motion.div>


      </div>

    </PageFade>
  );
}



/* ================= Feature Card ================= */

function Feature({ icon, title, text }) {

  return (
    <div className="feature-card">

      <div className="feature-icon">
        {icon}
      </div>

      <div>
        <h4>{title}</h4>
        <p>{text}</p>
      </div>

    </div>
  );
}
