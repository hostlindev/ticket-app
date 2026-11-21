const REDACTED = '[REDACTED]'

const RULES: Array<[RegExp, string]> = [
  // Cadenas de conexión Oracle: user/pass@host:1521/SID
  [/\b[\w$#]+\/[^\s@/'"]+@[\w.\-]+(?::\d+)?(?:\/[\w.\-]+)?/g, REDACTED],
  // JWT
  [/\beyJ[\w-]{5,}\.[\w-]{5,}\.[\w-]*/g, REDACTED],
  // Authorization: Bearer xxx / Basic xxx
  [/\b(bearer|basic)\s+[\w.~+/=-]+/gi, `$1 ${REDACTED}`],
  // JSON: "password":"x"
  [/("(?:password|passwd|pwd|secret|token|access_token|refresh_token|api[_-]?key|authorization)"\s*:\s*)"[^"]*"/gi, `$1"${REDACTED}"`],
  // query / form: token=abc
  [/\b((?:password|passwd|pwd|secret|token|access_token|refresh_token|api[_-]?key)\s*[=:]\s*)[^\s&"',;]+/gi, `$1${REDACTED}`],
  // correos
  [/[\w.+-]+@[\w-]+\.[\w.-]+/g, REDACTED],
]

/** Enmascara credenciales y datos personales; no recorta. */
export function redactSecrets(input: unknown): string {
  let out = String(input ?? '')
  for (const [re, rep] of RULES) out = out.replace(re, rep)
  return out
}

/** Redacta y recorta a `max` caracteres. */
export function sanitizeText(input: unknown, max = 500): string {
  return redactSecrets(input).slice(0, max)
}

/** Sustituye ids dinámicos (uuid, numéricos, ULID, hex largos) para agrupar rutas. */
export function normalizePath(path = '/'): string {
  return path
    .replace(/\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}(?=\/|$)/g, '/:uuid')
    .replace(/\/[0-9A-HJKMNP-TV-Z]{26}(?=\/|$)/g, '/:id')
    .replace(/\/[0-9a-f]{24,}(?=\/|$)/gi, '/:id')
    .replace(/\/\d+(?=\/|$)/g, '/:id')
}
