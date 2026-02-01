import { useState, useEffect } from "react";
import { motion } from "framer-motion";

import {
  FaEye,
  FaEyeSlash,
  FaUser,
  FaLock,
  FaBrain,
  FaBullseye,
  FaChartLine,
  FaFire,
  FaStar
} from "react-icons/fa";

import { FcGoogle } from "react-icons/fc";

import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { Link, useLocation, useNavigate } from "react-router-dom";

import PageFade from "./LoginAnimation/PageFade";
import "./index.css";


export default function Login() {

  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showPass, setShowPass] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();


  async function handleSubmit(e) {

    e.preventDefault();

    if (!email || !senha) {
      toast.error("Preencha todos os campos!");
      return;
    }

    try {

      await login(email, senha);
      navigate("/dashboard");

    } catch {

      toast.error("Credenciais inválidas!");

    }
  }




  return (
    <PageFade>

      <div className="login-layout">


        {/* ================= LEFT ================= */}
        <div className="login-left">

          {/* Brand */}
          <div className="login-brand">

            <div className="brand-icon">
              <FaStar />
            </div>

            <div className="brand-text">
              <h3>ChronoMind</h3>
              <span>Domine seu tempo</span>
            </div>

          </div>


          {/* Title */}
          <h1 className="login-title">
            Transforme sua <br />
            <span>produtividade</span>
          </h1>


          {/* Description */}
          <p className="login-desc">
            Gerencie tarefas, construa hábitos e alcance suas metas
            com uma experiência gamificada e motivadora.
          </p>


          {/* Cards */}
          <div className="login-features">

            <div className="feature-card">

              <div className="feature-icon">
                <FaBrain />
              </div>

              <div>
                <h4>Mapas Mentais</h4>
                <p>Organize suas ideias visualmente</p>
              </div>

            </div>


            <div className="feature-card">

              <div className="feature-icon">
                <FaBullseye />
              </div>

              <div>
                <h4>Metas</h4>
                <p>Defina e alcance objetivos</p>
              </div>

            </div>


            <div className="feature-card">

              <div className="feature-icon">
                <FaChartLine />
              </div>

              <div>
                <h4>Progresso</h4>
                <p>Acompanhe sua evolução</p>
              </div>

            </div>


            <div className="feature-card">

              <div className="feature-icon">
                <FaFire />
              </div>

              <div>
                <h4>Hábitos</h4>
                <p>Construa rotinas poderosas</p>
              </div>

            </div>

          </div>


          {/* Footer */}
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

            <button className="active">
              Entrar
            </button>

            <Link to="/register">
              Criar conta
            </Link>

          </div>


          {/* Card */}
          <div className="login-card">

            <h2>Bem-vindo de volta!</h2>

            <p>
              Entre para continuar sua jornada de produtividade
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
              <div className="login-label-row">

                <label>Senha</label>

                <button type="button">
                  Esqueceu a senha?
                </button>

              </div>


              <div className="login-input password">

                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Sua senha"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                />

                <span onClick={() => setShowPass(!showPass)}>
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </span>

              </div>


              {/* Button */}
              <button type="submit" className="login-btn">
                Entrar →
              </button>

            </form>


            <p className="login-footer">
              Ainda não tem conta?{" "}
              <Link to="/register">
                Criar conta
              </Link>
            </p>

          </div>

        </motion.div>


      </div>

    </PageFade>
  );
}
