/** 4px grid. Each unit below is `unit * 0.25rem` (1 = 4px, 4 = 16px, ...). */
export const SPACING_SCALE = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128] as const;

export type SpacingKey = (typeof SPACING_SCALE)[number];

export const spacing: Record<SpacingKey, string> = SPACING_SCALE.reduce(
  (acc, unit) => {
    acc[unit] = unit === 0 ? '0px' : `${unit * 0.25}rem`;
    return acc;
  },
  {} as Record<SpacingKey, string>,
);
