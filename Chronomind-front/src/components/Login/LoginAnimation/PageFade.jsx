import { motion, AnimatePresence } from "framer-motion";

export default function PageFade({ children, triggerExit = false, onExitComplete }) {
  return (
    <AnimatePresence onExitComplete={onExitComplete} mode="wait">
      {!triggerExit && (
        <motion.div
          key="page-enter"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{
            duration: 0.55,
            ease: [0.22, 1, 0.36, 1], // cubic-bezier premium
          }}
          style={{ height: "100%" }}
        >
          {children}
        </motion.div>
      )}

      {triggerExit && (
        <motion.div
          key="page-exit"
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 0, y: -18 }}
          transition={{
            duration: 0.55,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
