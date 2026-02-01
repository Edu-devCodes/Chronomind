import { useState, useEffect } from "react";
import Sidebar from "../Dashboard/Sidebar/Sidebar";
import { useAuth } from "../../contexts/AuthContext";

import { toast } from "react-toastify";

import {
  FiUser,
  FiMail,
  FiEdit3
} from "react-icons/fi";

import "./profile.css";

export default function Settings() {

  const { user, updateProfile } = useAuth();

  const [tab, setTab] = useState("profile");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");

  const [loading, setLoading] = useState(false);



  /* =========================
     CARREGA DADOS
  ========================= */
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setBio(user.bio || "");
    }
  }, [user]);



  /* =========================
     SALVAR PERFIL
  ========================= */
  async function saveProfile() {

    if (loading) return;

    try {
      setLoading(true);

      await updateProfile({
        name,
        bio
      });

      toast.success("Perfil atualizado com sucesso!");

    } catch (err) {
      console.error(err);

      toast.error("Erro ao salvar perfil");

    } finally {
      setLoading(false);
    }
  }



  return (
    <div className="settings-layout">

      <Sidebar />

      <div className="settings-content">


        {/* HEADER */}
        <div className="settings-header">
          <h1>Configurações</h1>
          <p>Personalize sua experiência</p>
        </div>



        {/* TABS */}
        <div className="settings-tabs">

          <button
            className={tab === "profile" ? "active" : ""}
            onClick={() => setTab("profile")}
          >
            Perfil
          </button>

          <button
            className={tab === "notifications" ? "active" : ""}
            onClick={() => setTab("notifications")}
          >
            Notificações
          </button>

        </div>



        {/* BODY */}
        <div className="settings-body">


          {/* ================= PERFIL ================= */}
          {tab === "profile" && (

            <div className="profile-premium">


              {/* HERO */}
              <div className="profile-hero">


                {/* AVATAR */}
                <div className="hero-avatar">
                  <span>{name?.[0] || "U"}</span>
                </div>



                {/* INFO */}
                <div className="hero-info">

                  <h2>{name || "Seu nome"}</h2>

                  <p>
                    {bio || "Edite seu perfil para deixar sua conta com a sua cara"}
                  </p>

                </div>

              </div>



              {/* FORM */}
              <div className="profile-form-premium">


                {/* NOME */}
                <div className="field">

                  <label>Nome</label>

                  <div className="field-input">
                    <FiUser />

                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome"
                    />
                  </div>

                </div>



                {/* EMAIL */}
                <div className="field">

                  <label>Email</label>

                  <div className="field-input locked">
                    <FiMail />

                    <input
                      value={email}
                      disabled
                    />
                  </div>

                </div>



                {/* BIO */}
                <div className="field full">

                  <label>Bio</label>

                  <div className="field-input">
                    <FiEdit3 />

                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Fale um pouco sobre você..."
                    />
                  </div>

                </div>



                {/* BUTTON */}
                <button
                  className="premium-save"
                  onClick={saveProfile}
                  disabled={loading}
                >
                  {loading ? "Salvando..." : "Salvar alterações"}
                </button>

              </div>

            </div>

          )}



          {/* ================= NOTIFICAÇÕES ================= */}
          {tab === "notifications" && (

            <div className="notify-premium">


              {/* MINI PROFILE */}
              <div className="notify-hero">

                <div className="mini-avatar">
                  <span>{name?.[0] || "U"}</span>
                </div>

                <div>
                  <h3>{name}</h3>
                  <p>{email}</p>
                </div>

              </div>



              <h2>Tipos de Alerta</h2>


              <NotifyItem
                title="Lembretes de Tasks"
                desc="Lembrar de tarefas pendentes"
              />

              <NotifyItem
                title="Lembretes de Hábitos"
                desc="Lembrar de manter hábitos"
              />

              <NotifyItem
                title="Alertas de Metas"
                desc="Notificar progresso"
              />

              <NotifyItem
                title="Relatório Semanal"
                desc="Resumo semanal"
              />

            </div>

          )}

        </div>

      </div>

    </div>
  );
}



/* ================= SWITCH ================= */

function NotifyItem({ title, desc }) {

  const [active, setActive] = useState(true);

  return (
    <div className="notify-item">

      <div>
        <h4>{title}</h4>
        <p>{desc}</p>
      </div>

      <label className="switch">

        <input
          type="checkbox"
          checked={active}
          onChange={() => setActive(!active)}
        />

        <span />

      </label>

    </div>
  );
}
