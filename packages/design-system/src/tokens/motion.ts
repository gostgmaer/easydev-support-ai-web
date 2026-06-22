import type { Transition, Variants } from 'framer-motion';

export const duration = {
  fast: 0.15,
  normal: 0.25,
  slow: 0.4,
} as const;

export const easing = {
  standard: [0.4, 0, 0.2, 1] as const,
  decelerate: [0, 0, 0.2, 1] as const,
  accelerate: [0.4, 0, 1, 1] as const,
};

export const transitions = {
  page: { duration: duration.normal, ease: easing.standard } satisfies Transition,
  modal: { duration: duration.normal, ease: easing.decelerate } satisfies Transition,
  drawer: { duration: duration.normal, ease: easing.decelerate } satisfies Transition,
  dropdown: { duration: duration.fast, ease: easing.standard } satisfies Transition,
  notification: { duration: duration.normal, ease: easing.standard } satisfies Transition,
} satisfies Record<string, Transition>;

export const variants = {
  page: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0, transition: transitions.page },
    exit: { opacity: 0, y: -8, transition: transitions.page },
  },
  modal: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1, transition: transitions.modal },
    exit: { opacity: 0, scale: 0.95, transition: transitions.modal },
  },
  drawer: {
    initial: { x: '100%' },
    animate: { x: 0, transition: transitions.drawer },
    exit: { x: '100%', transition: transitions.drawer },
  },
  dropdown: {
    initial: { opacity: 0, scale: 0.96, y: -4 },
    animate: { opacity: 1, scale: 1, y: 0, transition: transitions.dropdown },
    exit: { opacity: 0, scale: 0.96, y: -4, transition: transitions.dropdown },
  },
  notification: {
    initial: { opacity: 0, y: -16, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1, transition: transitions.notification },
    exit: { opacity: 0, scale: 0.98, transition: transitions.notification },
  },
} satisfies Record<string, Variants>;

export type MotionSurface = keyof typeof variants;

/** Returns near-instant, motion-free variants/transitions for `prefers-reduced-motion`. */
export function getReducedMotionVariants(surface: MotionSurface): Variants {
  const base = variants[surface];
  return {
    initial: { opacity: (base.initial as Record<string, number>)?.opacity ?? 0 },
    animate: { opacity: 1, transition: { duration: 0.01 } },
    exit: { opacity: 0, transition: { duration: 0.01 } },
  };
}
