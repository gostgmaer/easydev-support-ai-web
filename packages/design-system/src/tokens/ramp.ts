export interface HslColor {
  h: number;
  s: number;
  l: number;
}

export type ColorStep = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

export type ColorRamp = Record<ColorStep, string>;

export const COLOR_STEPS: ColorStep[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

/** Lightness curve (%) applied at each step, independent of hue/saturation. */
const LIGHTNESS_CURVE: Record<ColorStep, number> = {
  50: 97,
  100: 93,
  200: 86,
  300: 76,
  400: 65,
  500: 55,
  600: 46,
  700: 38,
  800: 31,
  900: 24,
};

export function hslString({ h, s, l }: HslColor): string {
  return `${h} ${s}% ${l}%`;
}

/** Generates a perceptually-ordered 50-900 ramp from a fixed hue/saturation. */
export function generateRamp(hue: number, saturation: number): ColorRamp {
  const ramp = {} as ColorRamp;
  for (const step of COLOR_STEPS) {
    ramp[step] = hslString({ h: hue, s: saturation, l: LIGHTNESS_CURVE[step] });
  }
  return ramp;
}

/** Parses `"h s% l%"` or `"hsl(h, s%, l%)"` or `#rrggbb` into an HslColor. */
export function parseColor(value: string): HslColor {
  const hslTriplet = value.match(/^\s*(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%\s*$/);
  if (hslTriplet) {
    return { h: Number(hslTriplet[1]), s: Number(hslTriplet[2]), l: Number(hslTriplet[3]) };
  }

  const hslFn = value.match(/^\s*hsl\(\s*(\d+(?:\.\d+)?)[,\s]+(\d+(?:\.\d+)?)%[,\s]+(\d+(?:\.\d+)?)%\s*\)\s*$/i);
  if (hslFn) {
    return { h: Number(hslFn[1]), s: Number(hslFn[2]), l: Number(hslFn[3]) };
  }

  const hex = value.match(/^#?([0-9a-f]{6})$/i);
  if (hex) {
    return hexToHsl(hex[1]!);
  }

  throw new Error(`Unsupported color format: ${value}`);
}

function hexToHsl(hex: string): HslColor {
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const delta = max - min;

  let h = 0;
  let s = 0;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = ((g - b) / delta) % 6;
        break;
      case g:
        h = (b - r) / delta + 2;
        break;
      default:
        h = (r - g) / delta + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }

  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

/** Generates a full 50-900 ramp from any single supported color string (tenant branding input). */
export function generateRampFromColor(value: string): ColorRamp {
  const { h, s } = parseColor(value);
  return generateRamp(h, s);
}
