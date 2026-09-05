import { motion } from "framer-motion";

export default function AnimatedSection({
  children,
  className = "",
  delay = 0,
  y = 32,
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function staggerContainer({ staggerChildren = 0.12, delayChildren = 0 } = {}) {
  return {
    initial: {},
    animate: {
      transition: { staggerChildren, delayChildren },
    },
  };
}

export function fadeUp(index = 0) {
  return {
    initial: { opacity: 0, y: 24 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] },
    },
  };
}
