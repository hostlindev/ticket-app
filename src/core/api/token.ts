/**
 * In-memory access token holder.
 *
 * Kept outside the Pinia store so `core` never imports a module:
 * interceptors and the auth store both talk to this tiny shared box.
 */
let accessToken: string | null = null

export function setAccessToken(token: string | null): void {
  accessToken = token
}

export function getAccessToken(): string | null {
  return accessToken
}
