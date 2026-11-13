const PREFIX = 'ticket-app:'

export const AUTH_SESSION_KEY = 'auth.session'

export function readStorage<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(PREFIX + key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function writeStorage<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // Private mode or quota exceeded: persistence is best-effort.
  }
}

export function removeStorage(key: string): void {
  try {
    window.localStorage.removeItem(PREFIX + key)
  } catch {
    // Ignore unavailable storage.
  }
}
