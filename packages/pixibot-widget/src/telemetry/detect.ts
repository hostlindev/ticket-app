import { sanitizeText } from './sanitize'

export const ORA_REGEX = /\bORA-\d{4,5}\b/i
/** Máximo de caracteres del cuerpo que se analiza. */
export const MAX_SCAN_CHARS = 64 * 1024

export interface PayloadInspection {
  isServerError: boolean
  isOracleError: boolean
  oraCode: string | null
  errorExcerpt: string | null
}

/** Busca ORA- en el cuerpo crudo (acotado) y luego sanitiza el extracto. */
export function inspectPayload(status: number, rawBody: unknown = ''): PayloadInspection {
  let text: string
  try {
    text = typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody) ?? ''
  } catch {
    text = ''
  }
  text = text.slice(0, MAX_SCAN_CHARS)
  const m = text.match(ORA_REGEX)
  return {
    isServerError: status >= 500,
    isOracleError: Boolean(m),
    oraCode: m ? m[0].toUpperCase() : null,
    errorExcerpt: sanitizeText(text) || null,
  }
}

/** Solo se lee el cuerpo de respuestas JSON o de texto. */
export function isReadableContentType(ct: string | null | undefined): boolean {
  return !ct || /json|text\/|xml/i.test(ct)
}
