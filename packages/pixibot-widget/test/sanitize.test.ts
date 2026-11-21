import { describe, expect, it } from 'vitest'
import { inspectPayload } from '../src/telemetry/detect'
import { normalizePath, redactSecrets, sanitizeText } from '../src/telemetry/sanitize'

describe('redactSecrets', () => {
  it.each([
    ['Bearer abc.def123', 'abc.def123'],
    ['url?token=s3cr3t&x=1', 's3cr3t'],
    ['password=hunter2', 'hunter2'],
    ['{"password":"hunter2"}', 'hunter2'],
    ['eyJhbGciOi.eyJzdWIiOiIx.SflKxwRJSMe', 'eyJzdWIi'],
    ['scott/tiger@db.host:1521/ORCL', 'tiger'],
    ['contacto juan@correo.com', 'juan@correo.com'],
  ])('%s', (input, leaked) => {
    const out = redactSecrets(input)
    expect(out).toContain('[REDACTED]')
    expect(out).not.toContain(leaked)
  })
})

describe('inspectPayload', () => {
  it('detecta ORA- pasado el carácter 500', () => {
    const r = inspectPayload(200, 'x'.repeat(2000) + ' ORA-00942: table missing')
    expect(r.isOracleError).toBe(true)
    expect(r.oraCode).toBe('ORA-00942')
    expect(r.errorExcerpt!.length).toBeLessThanOrEqual(500)
  })
  it('marca 5xx', () => expect(inspectPayload(503, '').isServerError).toBe(true))
  it('sanitiza el extracto', () => expect(inspectPayload(500, 'password=abc').errorExcerpt).toContain('[REDACTED]'))
})

describe('normalizePath', () => {
  it('normaliza ids', () => {
    expect(normalizePath('/tickets/123/items/9f1c2d3e-1111-2222-3333-444455556666')).toBe('/tickets/:id/items/:uuid')
    expect(normalizePath('/a/01ARZ3NDEKTSV4RRFFQ69G5FAV')).toBe('/a/:id')
  })
})

describe('sanitizeText', () => {
  it('recorta', () => expect(sanitizeText('a'.repeat(900)).length).toBe(500))
})
