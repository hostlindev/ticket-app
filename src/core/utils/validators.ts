const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function isEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim())
}

export function minLength(value: string, min: number): boolean {
  return value.length >= min
}

export function isRequired(value: string): boolean {
  return value.trim().length > 0
}
