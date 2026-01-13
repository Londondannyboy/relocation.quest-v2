"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface AnimatedSectionProps {
  id: string;
  index: number;
  children: ReactNode;
  className?: string;
}

export function AnimatedSection({
  id,
  index,
  children,
  className = "",
}: AnimatedSectionProps) {
  return (
    <motion.section
      id={`section-${id}`}
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: index * 0.15,
        ease: [0.25, 0.46, 0.45, 0.94], // Custom easing for smooth reveal
      }}
      className={`scroll-mt-24 ${className}`}
    >
      {children}
    </motion.section>
  );
}

// Variant for viewport-triggered animation (lazy reveal as user scrolls)
export function AnimatedSectionOnScroll({
  id,
  children,
  className = "",
}: Omit<AnimatedSectionProps, "index">) {
  return (
    <motion.section
      id={`section-${id}`}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={`scroll-mt-24 ${className}`}
    >
      {children}
    </motion.section>
  );
}

// Container for staggered children
export function AnimatedSectionContainer({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.15,
            delayChildren: 0.2,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Child variant for use within AnimatedSectionContainer
export function AnimatedSectionItem({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 40 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94],
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default AnimatedSection;
