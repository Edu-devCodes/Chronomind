import { useState } from "react"

import "./achievements.css"

import {
  FaLock,
  FaTrophy,
  FaFire,
  FaStar,
  FaMedal,
  FaBolt,
  FaInfoCircle,
  FaChevronDown,
  FaChevronUp
} from "react-icons/fa"

import { motion, AnimatePresence } from "framer-motion"



export default function Achievements({ list = [] }) {

  const [showAll, setShowAll] = useState(false)


  if (!list.length) return null


  function getIcon(type) {

    switch (type) {

      case "streak":
        return <FaFire />

      case "tasks":
        return <FaTrophy />

      case "goals":
        return <FaMedal />

      case "study":
        return <FaStar />

      case "master":
        return <FaBolt />

      default:
        return <FaTrophy />
    }
  }


  function getColor(type) {

    switch (type) {

      case "streak": return "purple"
      case "tasks": return "gold"
      case "goals": return "blue"
      case "study": return "green"
      case "master": return "red"

      default: return "gold"
    }
  }


  // 👉 Só mostra 3 se não estiver expandido
  const visibleAchievements = showAll
    ? list
    : list.slice(0, 3)



  return (

    <section className="achievements-section">

      {/* HEADER */}
      <div className="achv-header">

        <h2>🏆 Conquistas</h2>


        {list.length > 3 && (

          <button
            className="achv-toggle"
            onClick={() => setShowAll(!showAll)}
          >

            {showAll ? (
              <>
                Mostrar menos <FaChevronUp />
              </>
            ) : (
              <>
                Ver todas <FaChevronDown />
              </>
            )}

          </button>

        )}

      </div>



      {/* GRID */}
      <div className="achievements-grid achievements-3cols">


        <AnimatePresence>

          {visibleAchievements.map((achv, index) => {

            const unlocked = achv.unlocked

            const color = getColor(achv.type)

            const icon = getIcon(achv.type)


            const hasProgress =
              achv.progress !== undefined &&
              achv.goal !== undefined


            const percent = hasProgress
              ? Math.min(
                  Math.round((achv.progress / achv.goal) * 100),
                  100
                )
              : 0


            return (

              <motion.div
                key={achv.id}

                className={`
                  achv-card
                  achv-${color}
                  ${unlocked ? "achv-unlocked" : "achv-locked"}
                  ${index === 0 ? "achv-featured" : ""}
                `}

                layout

                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}

                transition={{ duration: .3 }}

                whileHover={{ scale: 1.05 }}
              >


                {/* INFO */}
                {!unlocked && (

                  <div
                    className="achv-info"
                    title={achv.hint}
                  >
                    <FaInfoCircle />
                  </div>

                )}


                {/* BG ICON */}
                <div className="achv-bg-icon">
                  {icon}
                </div>


                {/* MAIN ICON */}
                <div className="achv-icon">

                  {unlocked
                    ? icon
                    : <FaLock />
                  }

                </div>


                <h3>{achv.title}</h3>

                <p>
                  {unlocked
                    ? achv.description
                    : achv.hint
                  }
                </p>


                {/* PROGRESS */}
                {!unlocked && hasProgress && (

                  <div className="achv-progress">

                    <div className="achv-progress-bar">

                      <div
                        className="achv-progress-fill"
                        style={{
                          width: percent + "%"
                        }}
                      />

                    </div>


                    <small>
                      {achv.progress} / {achv.goal}
                    </small>

                  </div>

                )}


                {/* BADGE */}
                {unlocked && (

                  <span className="achv-badge">
                    Conquistado
                  </span>

                )}

              </motion.div>

            )

          })}

        </AnimatePresence>

      </div>

    </section>
  )
}
