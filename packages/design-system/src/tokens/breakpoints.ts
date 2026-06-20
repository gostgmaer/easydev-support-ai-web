export const breakpoints = {
  mobile: '640px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1280px',
  ultrawide: '1536px',
} as const;

export type BreakpointKey = keyof typeof breakpoints;
