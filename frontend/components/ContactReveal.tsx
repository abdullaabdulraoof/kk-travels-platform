"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type ContactRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export default function ContactReveal({
  children,
  className,
  delay = 0,
}: ContactRevealProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reducedMotion ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={
        reducedMotion
          ? { duration: 0 }
          : { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }
      }
    >
      {children}
    </motion.div>
  );
}
