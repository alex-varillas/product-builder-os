import { type Variants, type Transition } from "motion/react";

// Shared spring transition — used wherever a spring feels right
export const springSoft: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

export const springSnappy: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 35,
};

// Fade + slide up — use as initial/animate/exit on individual items
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: springSoft },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

// Fade only — for overlays, backdrops
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

// Stagger container — wrap lists; children use fadeUp
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
};

// Modal spring — scale + fade in from slightly below
export const modalSpring: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0, transition: springSoft },
  exit: { opacity: 0, scale: 0.96, y: 4, transition: { duration: 0.15 } },
};

// Button micro-interaction presets (pass directly to motion element props)
export const buttonTap = { scale: 0.97 };
export const buttonHover = { scale: 1.02 };

// Slide left/right for tab transitions
export function tabVariants(direction: 1 | -1): Variants {
  return {
    hidden: { opacity: 0, x: direction * 20 },
    visible: { opacity: 1, x: 0, transition: springSoft },
    exit: { opacity: 0, x: direction * -20, transition: { duration: 0.15 } },
  };
}
