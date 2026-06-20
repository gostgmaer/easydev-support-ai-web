import { generateRamp, type ColorRamp } from './ramp';

export const colorFamilies = {
  primary: generateRamp(221, 83),
  secondary: generateRamp(262, 60),
  neutral: generateRamp(215, 16),
  success: generateRamp(142, 71),
  warning: generateRamp(38, 92),
  danger: generateRamp(346, 77),
  info: generateRamp(199, 89),
  accent: generateRamp(189, 80),
} satisfies Record<string, ColorRamp>;

export type ColorFamily = keyof typeof colorFamilies;

const WHITE = '0 0% 100%';

export type SemanticColorToken =
  | 'background'
  | 'foreground'
  | 'card'
  | 'cardForeground'
  | 'popover'
  | 'popoverForeground'
  | 'border'
  | 'input'
  | 'ring'
  | 'muted'
  | 'mutedForeground'
  | 'primary'
  | 'primaryForeground'
  | 'secondary'
  | 'secondaryForeground'
  | 'accent'
  | 'accentForeground'
  | 'danger'
  | 'dangerForeground'
  | 'success'
  | 'successForeground'
  | 'warning'
  | 'warningForeground'
  | 'info'
  | 'infoForeground';

export type SemanticColorMap = Record<SemanticColorToken, string>;

const { primary, secondary, neutral, success, warning, danger, info, accent } = colorFamilies;

export const lightTheme: SemanticColorMap = {
  background: neutral[50],
  foreground: neutral[900],
  card: WHITE,
  cardForeground: neutral[900],
  popover: WHITE,
  popoverForeground: neutral[900],
  border: neutral[200],
  input: neutral[200],
  ring: primary[500],
  muted: neutral[100],
  mutedForeground: neutral[500],
  primary: primary[600],
  primaryForeground: WHITE,
  secondary: secondary[600],
  secondaryForeground: WHITE,
  accent: accent[500],
  accentForeground: neutral[900],
  danger: danger[600],
  dangerForeground: WHITE,
  success: success[600],
  successForeground: WHITE,
  warning: warning[500],
  warningForeground: neutral[900],
  info: info[600],
  infoForeground: WHITE,
};

export const darkTheme: SemanticColorMap = {
  background: neutral[900],
  foreground: neutral[50],
  card: neutral[800],
  cardForeground: neutral[50],
  popover: neutral[800],
  popoverForeground: neutral[50],
  border: neutral[700],
  input: neutral[700],
  ring: primary[400],
  muted: neutral[800],
  mutedForeground: neutral[400],
  primary: primary[500],
  primaryForeground: WHITE,
  secondary: secondary[500],
  secondaryForeground: WHITE,
  accent: accent[400],
  accentForeground: neutral[900],
  danger: danger[500],
  dangerForeground: WHITE,
  success: success[500],
  successForeground: WHITE,
  warning: warning[400],
  warningForeground: neutral[900],
  info: info[500],
  infoForeground: WHITE,
};

/** Semantic tokens whose value is a brand color and is therefore eligible for tenant overrides. */
export const TENANT_OVERRIDABLE_FAMILIES: ColorFamily[] = ['primary', 'secondary'];

export * from './ramp';
