export const opacity = {
  0: '0',
  5: '0.05',
  10: '0.1',
  20: '0.2',
  25: '0.25',
  30: '0.3',
  40: '0.4',
  50: '0.5',
  60: '0.6',
  70: '0.7',
  75: '0.75',
  80: '0.8',
  90: '0.9',
  95: '0.95',
  100: '1',
} as const;

export type OpacityKey = keyof typeof opacity;

/** Named opacities for recurring enterprise-UI interaction states. */
export const semanticOpacity = {
  disabled: opacity[50],
  hoverOverlay: opacity[5],
  pressedOverlay: opacity[10],
  scrim: opacity[60],
  skeletonShimmer: opacity[20],
} as const;
