import { motion, useInView } from "framer-motion";
import { useRef, ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  className?: string;
  blur?: boolean;
  scale?: boolean;
}

export function ScrollReveal({ 
  children, 
  delay = 0, 
  direction = "up",
  className = "",
  blur = true,
  scale = false,
}: ScrollRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });

  const directionOffsets = {
    up: { y: 50, x: 0 },
    down: { y: -50, x: 0 },
    left: { y: 0, x: 50 },
    right: { y: 0, x: -50 },
  };

  const offset = directionOffsets[direction];

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ 
        opacity: 0, 
        ...offset,
        filter: blur ? "blur(8px)" : "blur(0px)",
        scale: scale ? 0.92 : 1,
      }}
      animate={isInView ? { 
        opacity: 1, 
        x: 0, 
        y: 0, 
        filter: "blur(0px)",
        scale: 1,
      } : { 
        opacity: 0, 
        ...offset,
        filter: blur ? "blur(8px)" : "blur(0px)",
        scale: scale ? 0.92 : 1,
      }}
      transition={{ 
        duration: 0.8, 
        delay, 
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
