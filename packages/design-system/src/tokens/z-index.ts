export const zIndex = {
  base: 0,
  sticky: 100,
  dropdown: 1000,
  overlay: 1500,
  modal: 2000,
  popover: 2500,
  toast: 2800,
  tooltip: 3000,
} as const;

export type ZIndexKey = keyof typeof zIndex;
