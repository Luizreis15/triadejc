import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerContainer({ 
  children, 
  className = "",
  staggerDelay = 0.1 
}: StaggerContainerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: {},
        visible: { 
          transition: { 
            staggerChildren: staggerDelay 
          } 
        }
      }}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

export function StaggerItem({ children, className = "" }: StaggerItemProps) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, x: -20 },
        visible: { 
          opacity: 1, 
          x: 0,
          transition: {
            duration: 0.5,
            ease: [0.25, 0.4, 0.25, 1]
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
}
