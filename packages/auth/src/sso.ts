import { generateRequestId, safeLocalStorage } from '@easydev/utils';
import type { SsoProviderConfig } from '@easydev/types';

const SSO_STATE_KEY = 'easydev.sso.state';

/** Builds the provider authorization URL with a CSRF-protecting state nonce. */
export function buildSsoRedirectUrl(config: SsoProviderConfig): string {
  const state = generateRequestId();
  safeLocalStorage.set(SSO_STATE_KEY, state);

  const url = new URL(config.authorizationUrl);
  url.searchParams.set('client_id', config.clientId);
  url.searchParams.set('redirect_uri', config.redirectUri);
  url.searchParams.set('scope', config.scope);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('state', state);
  return url.toString();
}

export interface SsoCallbackResult {
  code: string;
  state: string;
  stateValid: boolean;
}

/** Validates and extracts the authorization code from an SSO callback URL. */
export function parseSsoCallback(callbackUrl: string): SsoCallbackResult | null {
  const url = new URL(callbackUrl);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  if (!code || !state) return null;

  const expectedState = safeLocalStorage.get(SSO_STATE_KEY);
  safeLocalStorage.remove(SSO_STATE_KEY);

  return { code, state, stateValid: expectedState === state };
}
