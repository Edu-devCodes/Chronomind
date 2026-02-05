import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

export default function PageFade({ children }) {
  const location = useLocation();

  const variants = {
    initial: {
      opacity: 0,
      y: 30,
      scale: 0.96,
      filter: "blur(10px)",
      boxShadow: "0 0 0px rgba(0,255,180,0)"
    },

    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      boxShadow: "0 0 35px rgba(0,255,180,0.12)"
    },

    exit: {
      opacity: 0,
      y: -20,
      scale: 1.03,
      filter: "blur(12px)",
      boxShadow: "0 0 0px rgba(0,255,180,0)"
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{
          duration: 0.5,
          ease: [0.22, 1, 0.36, 1]
        }}
        style={{
          height: "100%",
          width: "100%",
          position: "relative"
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
