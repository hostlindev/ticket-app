export interface ApiError {
  code: string
  message: string
  fieldErrors?: Record<string, string>
}

/** Extracts a user-facing message from an ApiError, Error or unknown value. */
export function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message: unknown }).message
    if (typeof message === 'string' && message) return message
  }
  return fallback
}
