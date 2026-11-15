import type { ClientContext } from './types'

/** Detecta navegador y versión a partir del user agent (orden importa). */
export function detectBrowser(ua: string = navigator.userAgent): string {
  const rules: Array<[RegExp, string]> = [
    [/Edg(?:e|A|iOS)?\/([\d.]+)/, 'Edge'],
    [/OPR\/([\d.]+)/, 'Opera'],
    [/SamsungBrowser\/([\d.]+)/, 'Samsung Internet'],
    [/Firefox\/([\d.]+)|FxiOS\/([\d.]+)/, 'Firefox'],
    [/(?:Chrome|CriOS)\/([\d.]+)/, 'Chrome'],
    [/Version\/([\d.]+).*Safari/, 'Safari'],
  ]
  for (const [re, name] of rules) {
    const m = ua.match(re)
    if (m) return `${name} ${(m[1] ?? m[2] ?? '').split('.')[0]}`.trim()
  }
  return 'Desconocido'
}

function detectOS(ua: string): string {
  if (/Windows NT 10/.test(ua)) return 'Windows 10/11'
  if (/Windows/.test(ua)) return 'Windows'
  if (/Android ([\d.]+)/.test(ua)) return `Android ${ua.match(/Android ([\d.]+)/)?.[1]}`
  if (/iPhone|iPad|iPod/.test(ua)) return 'iOS'
  if (/Mac OS X/.test(ua)) return 'macOS'
  if (/CrOS/.test(ua)) return 'ChromeOS'
  if (/Linux/.test(ua)) return 'Linux'
  return 'SO desconocido'
}

/** Todo lo que se puede saber del cliente sin preguntarle al usuario. La IP la captura la API. */
export function collectContext(): ClientContext {
  const ua = navigator.userAgent
  return {
    browser: `${detectBrowser(ua)} · ${detectOS(ua)}`,
    userAgent: ua,
    platform: navigator.platform ?? '',
    language: navigator.language ?? '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? '',
    screen: `${screen.width}x${screen.height}@${window.devicePixelRatio}x`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    url: location.href,
    referrer: document.referrer,
  }
}
