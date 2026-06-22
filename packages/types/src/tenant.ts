/**
 * Tenant-supplied theming. Structurally matches @easydev/design-system's TenantBranding
 * so it can be passed straight into TenantBrandingProvider without a package dependency
 * from @easydev/types onto the design-system package.
 */
export interface TenantBrandingConfig {
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
  faviconUrl?: string;
  customCssVariables?: Record<string, string>;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: string;
  logoUrl?: string;
  status: 'ACTIVE' | 'TRIAL' | 'SUSPENDED' | 'CANCELLED';
  branding?: TenantBrandingConfig;
}

export interface TenantMembership {
  tenant: Tenant;
  roleKeys: string[];
  isDefault: boolean;
}

export interface TenantSwitchResult {
  tenant: Tenant;
  accessToken: string;
  refreshToken: string;
}
