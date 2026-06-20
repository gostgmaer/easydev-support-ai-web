export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: string;
  logoUrl?: string;
  status: 'ACTIVE' | 'TRIAL' | 'SUSPENDED' | 'CANCELLED';
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
