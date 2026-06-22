export interface TenantBranding {
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
  faviconUrl?: string;
  /** Raw CSS custom property overrides, e.g. `{ '--radius': '0.25rem' }`. Applied verbatim. */
  customCssVariables?: Record<string, string>;
}
