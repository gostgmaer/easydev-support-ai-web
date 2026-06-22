'use client';

import * as React from 'react';
import { generateRampFromColor, COLOR_STEPS } from './tokens/ramp';
import type { TenantBranding } from './types';

interface TenantBrandingContextValue {
  branding: TenantBranding | null;
}

const TenantBrandingContext = React.createContext<TenantBrandingContextValue>({ branding: null });

function applyRampVariables(root: HTMLElement, familyVarPrefix: string, color: string): void {
  const ramp = generateRampFromColor(color);
  for (const step of COLOR_STEPS) {
    root.style.setProperty(`--${familyVarPrefix}-${step}`, ramp[step]);
  }
  // The semantic alias (e.g. --primary) tracks the family's "600" step, matching
  // the default light-theme semantic mapping authored in tokens/colors.ts.
  root.style.setProperty(`--${familyVarPrefix}`, ramp[600]);
}

export interface TenantBrandingProviderProps {
  children: React.ReactNode;
  branding: TenantBranding | null;
}

/**
 * Applies a tenant's brand colors/custom CSS variables to `:root` at runtime.
 * Falls back to the default design-system palette when no branding is set.
 */
export function TenantBrandingProvider({ children, branding }: TenantBrandingProviderProps) {
  React.useEffect(() => {
    const root = document.documentElement;
    const appliedProperties: string[] = [];

    if (branding?.primaryColor) {
      applyRampVariables(root, 'primary', branding.primaryColor);
      appliedProperties.push('--primary', ...COLOR_STEPS.map((s) => `--primary-${s}`));
    }
    if (branding?.secondaryColor) {
      applyRampVariables(root, 'secondary', branding.secondaryColor);
      appliedProperties.push('--secondary', ...COLOR_STEPS.map((s) => `--secondary-${s}`));
    }
    if (branding?.customCssVariables) {
      for (const [property, value] of Object.entries(branding.customCssVariables)) {
        root.style.setProperty(property, value);
        appliedProperties.push(property);
      }
    }

    return () => {
      for (const property of appliedProperties) root.style.removeProperty(property);
    };
  }, [branding]);

  const value = React.useMemo<TenantBrandingContextValue>(() => ({ branding }), [branding]);

  return <TenantBrandingContext.Provider value={value}>{children}</TenantBrandingContext.Provider>;
}

export function useTenantBranding(): TenantBrandingContextValue {
  return React.useContext(TenantBrandingContext);
}
