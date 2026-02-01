import { NavLink } from "react-router-dom"
import {
  FiGrid,
  FiCheckSquare,
  FiTarget,
  FiRepeat,
  FiBook,
  FiBarChart2,
  FiSettings,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
} from "react-icons/fi"
import { PiBrain } from "react-icons/pi"
import { useAuth } from "../../../contexts/AuthContext"
import { useState } from "react"
import "./Sidebar.css"

export default function Sidebar() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)

  const menu = [
    { name: "Dashboard", icon: <FiGrid />, to: "/dashboard" },
    { name: "Mapa Mental", icon: <PiBrain />, to: "/mindmap" },
    { name: "Tarefas", icon: <FiCheckSquare />, to: "/tasks" },
    { name: "Metas", icon: <FiTarget />, to: "/goals" },
    { name: "Hábitos", icon: <FiRepeat />, to: "/habits" },
    { name: "Conteúdos", icon: <FiBook />, to: "/studyes" },
    { name: "Evolução", icon: <FiBarChart2 />, to: "/charts" },
    { name: "Perfil", icon: <FiUser />, to: "/profile" },
  ]

  return (
    <>
      {/* BOTÃO TOGGLE (☰ / ❌) — MOBILE */}
      <button
        className={`mobile-toggle ${open ? "open" : ""}`}
        onClick={() => setOpen(!open)}
      >
        {open ? <FiX /> : <FiMenu />}
      </button>

      {/* OVERLAY */}
      <div
        className={`sidebar-overlay ${open ? "show" : ""}`}
        onClick={() => setOpen(false)}
      />

      {/* SIDEBAR */}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="top">
          <div className="brand">
            <h1>
              Chrono<span>Mind</span>
            </h1>
          </div>

          <nav className="menu">
            {menu.map(item => (
              <NavLink
                key={item.name}
                to={item.to}
                className="menu-item"
                onClick={() => setOpen(false)}
              >
                <span className="icon">{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="bottom">
          <div className="user-info">
            <span className="email">{user?.email}</span>
            <button className="logout" onClick={logout}>
              <FiLogOut />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
