import { captureScreen, prepareUploadedImage } from './image'
import { collectContext } from './collect'
import { robotSvg } from './robot'
import { css } from './styles'
import { submitReport } from './submit'
import { getTelemetrySnapshot, installMonitor } from './telemetry'
import type { IssueType, PixibotHandle, PixibotOptions, PixibotUser } from './types'

const ISSUE_TYPES: Array<{ id: IssueType; label: string; icon: string }> = [
  { id: 'blocks_flow', label: 'Me bloquea el flujo', icon: '⛔' },
  { id: 'not_working', label: 'Algo no funciona', icon: '⚠️' },
  { id: 'wrong_info', label: 'Información incorrecta', icon: '📄' },
  { id: 'slow', label: 'Va muy lento', icon: '🐢' },
  { id: 'visual', label: 'Se ve mal', icon: '🎨' },
  { id: 'other', label: 'Otro', icon: '💬' },
]

type ImageMode = 'none' | 'screenshot' | 'upload'

const MIN_CHARS = 10
const MAX_CHARS = 1000
const HOST_ID = 'pixibot-widget-host'

const template = (size: number) => `
<div class="root">
  <div class="bubble" part="bubble" role="status" hidden>
    <button class="x" type="button" aria-label="Cerrar saludo">×</button>
    <span class="msg"></span><span class="caret"></span>
    <span class="cta">Toca para reportar una incidencia →</span>
  </div>
  <div class="fabwrap"><button class="fab wave" type="button" aria-label="Abrir Pixibot, asistente de incidencias" aria-haspopup="dialog">
    ${robotSvg(size)}<span class="dot" aria-hidden="true"></span>
  </button><span class="tip" role="tooltip">¿Quieres reportar una incidencia?</span></div>
  <div class="backdrop" hidden>
    <div class="dialog" role="dialog" aria-modal="false" aria-labelledby="pxb-title">
      <div class="head">
        <span class="avatar">${robotSvg(34)}</span>
        <div><h2 id="pxb-title">Reportar una incidencia</h2><p class="sub"></p></div>
        <button class="close" type="button" aria-label="Cerrar">×</button>
      </div>
      <form class="form" novalidate>
        <div class="body">
          <div class="field">
            <span class="lbl" id="pxb-type-l">¿Qué tipo de problema es?</span>
            <div class="types" role="radiogroup" aria-labelledby="pxb-type-l">
              ${ISSUE_TYPES.map(
                (t) =>
                  `<button type="button" class="type" role="radio" aria-checked="false" data-type="${t.id}"><span class="ic" aria-hidden="true">${t.icon}</span>${t.label}</button>`,
              ).join('')}
            </div>
            <p class="ferr" data-for="type" role="alert" hidden></p>
          </div>
          <div class="field">
            <label for="pxb-desc">Cuéntame qué pasó</label>
            <textarea id="pxb-desc" maxlength="${MAX_CHARS}" placeholder="Ej.: Al guardar el formulario aparece un error y no avanza…"></textarea>
            <div class="meta"><span class="need"></span><span class="count">0/${MAX_CHARS}</span></div>
            <p class="ferr" data-for="desc" role="alert" hidden></p>
          </div>
          <div class="field">
            <span class="lbl" id="pxb-img-l">Imagen <span class="opt">(opcional)</span></span>
            <div class="modes" role="radiogroup" aria-labelledby="pxb-img-l">
              <button type="button" class="mode" role="radio" aria-checked="true" data-mode="none"><span class="ic" aria-hidden="true">🚫</span>Sin imagen</button>
              <button type="button" class="mode" role="radio" aria-checked="false" data-mode="screenshot"><span class="ic" aria-hidden="true">📸</span>Captura de Pixibot</button>
              <button type="button" class="mode" role="radio" aria-checked="false" data-mode="upload"><span class="ic" aria-hidden="true">🖼️</span>Adjuntar imagen</button>
            </div>
            <p class="hint"></p>
            <input class="file" type="file" accept="image/png,image/jpeg,image/webp" />
            <div class="preview" hidden>
              <img alt="Vista previa de la imagen adjunta" />
              <div class="info"><b></b><span></span></div>
              <button type="button" class="link again"></button>
            </div>
          </div>
          <p class="privacy">Pixibot también enviará tu nombre, el navegador y la pantalla que usas para ayudar al equipo a resolverlo más rápido.</p>
        </div>
        <p class="error" role="alert" hidden></p>
        <div class="foot">
          <button type="button" class="btn cancel">Cancelar</button>
          <button type="submit" class="btn primary"><span class="spinner" hidden></span><span class="label">Enviar reporte</span></button>
        </div>
      </form>
      <div class="sending" hidden role="status" aria-live="polite">
        <div class="loader"><span class="ring"></span><span class="bot">${robotSvg(44)}</span></div>
        <b class="sending-title">Enviando tu reporte…</b>
        <span class="sending-sub"></span>
      </div>
      <div class="done" hidden>
        ${robotSvg(84)}
        <h3>¡Reporte enviado!</h3>
        <p class="done-msg"></p>
        <button type="button" class="btn primary done-close">Listo</button>
      </div>
    </div>
  </div>
</div>`

const HINTS: Record<ImageMode, string> = {
  none: 'Puedes enviar el reporte solo con texto.',
  screenshot: 'Pixibot tomará una foto de lo que ves en esta pantalla (sin incluir este panel).',
  upload: 'PNG, JPG o WebP. Pixibot la reducirá para que no pese demasiado.',
}

export function mountPixibot(options: PixibotOptions): PixibotHandle {
  document.getElementById(HOST_ID)?.remove()

  const maxBytes = (options.maxImageKB ?? 800) * 1024
  const getUser = (): PixibotUser | null =>
    typeof options.user === 'function' ? options.user() : options.user
  let userOverride: PixibotUser | null | undefined

  const currentUser = () => (userOverride !== undefined ? userOverride : getUser())
  const getApiKey = () => (typeof options.apiKey === 'function' ? options.apiKey() : (options.apiKey ?? null))

  const host = document.createElement('div')
  host.id = HOST_ID
  const shadow = host.attachShadow({ mode: 'open' })
  const style = document.createElement('style')
  style.textContent = css
  shadow.append(style)
  const wrap = document.createElement('div')
  wrap.innerHTML = template(32)
  shadow.append(...Array.from(wrap.childNodes))

  const $ = <T extends Element>(sel: string) => shadow.querySelector(sel) as T
  const root = $<HTMLElement>('.root')
  const bubble = $<HTMLElement>('.bubble')
  const msg = $<HTMLElement>('.msg')
  const caret = $<HTMLElement>('.caret')
  const fab = $<HTMLButtonElement>('.fab')
  const backdrop = $<HTMLElement>('.backdrop')
  const form = $<HTMLFormElement>('.form')
  const done = $<HTMLElement>('.done')
  const desc = $<HTMLTextAreaElement>('textarea')
  const count = $<HTMLElement>('.count')
  const need = $<HTMLElement>('.need')
  const hint = $<HTMLElement>('.hint')
  const fileInput = $<HTMLInputElement>('.file')
  const preview = $<HTMLElement>('.preview')
  const previewImg = $<HTMLImageElement>('.preview img')
  const previewName = $<HTMLElement>('.preview b')
  const previewMeta = $<HTMLElement>('.preview .info span')
  const againBtn = $<HTMLButtonElement>('.again')
  const errorBox = $<HTMLElement>('.error')
  const submitBtn = $<HTMLButtonElement>('.btn.primary[type=submit]')
  const spinner = $<HTMLElement>('.spinner')
  const label = $<HTMLElement>('.label')
  const sub = $<HTMLElement>('.sub')
  const typesBox = $<HTMLElement>('.types')
  const typeErr = $<HTMLElement>('.ferr[data-for=type]')
  const descErr = $<HTMLElement>('.ferr[data-for=desc]')
  const sending = $<HTMLElement>('.sending')
  const sendingSub = $<HTMLElement>('.sending-sub')

  if (options.position === 'bottom-left') root.classList.add('left')
  if (options.accentColor) {
    const c = options.accentColor
    root.style.setProperty('--pxb-accent-400', c)
    root.style.setProperty('--pxb-accent-500', c)
    root.style.setProperty('--pxb-accent-600', c)
    root.style.setProperty('--pxb-accent-700', `color-mix(in srgb, ${c} 75%, black)`)
    root.style.setProperty('--pxb-accent-100', `color-mix(in srgb, ${c} 14%, white)`)
    root.style.setProperty('--pxb-shadow', `color-mix(in srgb, ${c} 45%, white)`)
  }

  let issueType: IssueType | null = null
  let mode: ImageMode = 'none'
  let imageBlob: Blob | null = null
  let imageToken = 0 // descarta resultados de capturas/cargas obsoletas
  let busy = false
  let typingTimer: number | undefined
  let bubbleTimer: number | undefined
  let lastFocus: Element | null = null

  const firstName = () => (currentUser()?.name ?? '').trim().split(/\s+/)[0] ?? ''

  /* ---------- Saludo ---------- */
  function greeting(): string {
    const n = firstName()
    return `Hola${n ? ` ${n}` : ''}, soy Pixibot, tu asistente de incidencias. Si presentas algún problema con el sistema, no dudes en reportarlo.`
  }

  function showBubble(): void {
    if (!backdrop.hidden) return // el modal ya está abierto
    const full = greeting()
    bubble.hidden = false
    bubble.classList.remove('leaving')
    bubble.setAttribute('aria-label', full)
    caret.classList.remove('done')
    msg.setAttribute('aria-hidden', 'true')
    msg.textContent = ''
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    let i = 0
    window.clearInterval(typingTimer)
    if (reduce) {
      msg.textContent = full
      caret.classList.add('done')
    } else {
      typingTimer = window.setInterval(() => {
        msg.textContent = full.slice(0, ++i)
        if (i >= full.length) {
          window.clearInterval(typingTimer)
          caret.classList.add('done')
        }
      }, 22)
    }
    bubbleTimer = window.setTimeout(hideBubble, 22_000)
  }

  function hideBubble(): void {
    window.clearInterval(typingTimer)
    window.clearTimeout(bubbleTimer)
    if (bubble.hidden) return
    bubble.classList.add('leaving')
    window.setTimeout(() => (bubble.hidden = true), 200)
  }

  /* ---------- Formulario ---------- */
  function setError(text: string | null): void {
    errorBox.hidden = !text
    errorBox.textContent = text ?? ''
    if (text) {
      errorBox.style.animation = 'none'
      void errorBox.offsetWidth
      errorBox.style.animation = ''
    }
  }

  function setFieldError(el: HTMLElement, text: string | null, animate = true): void {
    const wasShown = !el.hidden
    el.hidden = !text
    el.textContent = text ?? ''
    if (text && animate && !wasShown) {
      el.style.animation = 'none'
      void el.offsetWidth
      el.style.animation = ''
    }
  }

  const descMessage = (): string | null =>
    desc.value.trim().length < MIN_CHARS ? `Describe el problema con al menos ${MIN_CHARS} caracteres.` : null

  /** Valida y muestra cada error junto a su campo; enfoca el primero inválido. */
  function validate(): boolean {
    const typeMsg = issueType ? null : 'Elige qué tipo de problema es.'
    const descMsg = descMessage()
    setFieldError(typeErr, typeMsg)
    setFieldError(descErr, descMsg)
    typesBox.classList.toggle('invalid', !!typeMsg)
    desc.classList.toggle('invalid', !!descMsg)
    const first = typeMsg ? (shadow.querySelector('.type') as HTMLElement) : descMsg ? desc : null
    if (first) {
      first.scrollIntoView({ block: 'center', behavior: 'smooth' })
      first.focus({ preventScroll: true })
    }
    return !first
  }

  function refreshCounter(): void {
    const len = desc.value.trim().length
    count.textContent = `${desc.value.length}/${MAX_CHARS}`
    need.textContent = len < MIN_CHARS ? `Escribe al menos ${MIN_CHARS} caracteres` : ''
  }

  function clearImage(): void {
    imageToken++
    imageBlob = null
    fileInput.value = ''
    preview.hidden = true
    if (previewImg.src.startsWith('blob:')) URL.revokeObjectURL(previewImg.src)
    previewImg.removeAttribute('src')
  }

  function showPreview(blob: Blob, name: string, againLabel: string): void {
    if (previewImg.src.startsWith('blob:')) URL.revokeObjectURL(previewImg.src)
    previewImg.src = URL.createObjectURL(blob)
    previewName.textContent = name
    previewMeta.textContent = `${Math.max(1, Math.round(blob.size / 1024))} KB`
    againBtn.textContent = againLabel
    preview.hidden = false
  }

  async function takeScreenshot(): Promise<void> {
    const token = ++imageToken
    hint.textContent = 'Pixibot está tomando la captura…'
    setError(null)
    try {
      const blob = await captureScreen(host, maxBytes)
      if (token !== imageToken) return
      imageBlob = blob
      hint.textContent = HINTS.screenshot
      showPreview(blob, 'Captura de pantalla', 'Volver a capturar')
    } catch {
      if (token !== imageToken) return
      setMode('none')
      setError('Pixibot no pudo tomar la captura. Puedes adjuntar una imagen o enviar solo el texto.')
    }
  }

  function setMode(next: ImageMode): void {
    mode = next
    shadow.querySelectorAll<HTMLElement>('.mode').forEach((b) =>
      b.setAttribute('aria-checked', String(b.dataset.mode === next)),
    )
    clearImage()
    hint.textContent = HINTS[next]
    if (next === 'screenshot') void takeScreenshot()
    if (next === 'upload') fileInput.click()
  }

  async function onFileChosen(): Promise<void> {
    const file = fileInput.files?.[0]
    if (!file) {
      if (!imageBlob) setMode('none')
      return
    }
    const token = ++imageToken
    setError(null)
    hint.textContent = 'Procesando imagen…'
    try {
      const blob = await prepareUploadedImage(file, maxBytes)
      if (token !== imageToken) return
      imageBlob = blob
      hint.textContent = HINTS.upload
      showPreview(blob, file.name, 'Cambiar')
    } catch (e) {
      if (token !== imageToken) return
      setMode('none')
      setError((e as Error).message)
    }
  }

  function resetForm(): void {
    issueType = null
    shadow.querySelectorAll('.type').forEach((b) => b.setAttribute('aria-checked', 'false'))
    desc.value = ''
    setMode('none')
    refreshCounter()
    setError(null)
    setFieldError(typeErr, null)
    setFieldError(descErr, null)
    typesBox.classList.remove('invalid')
    desc.classList.remove('invalid')
  }

  /* ---------- Abrir / cerrar ---------- */
  function open(): void {
    if (!backdrop.hidden) return
    hideBubble()
    lastFocus = document.activeElement
    const u = currentUser()
    sub.textContent = u ? `${u.name}, cuéntame qué está pasando y lo reviso con el equipo.` : 'Cuéntame qué está pasando.'
    form.hidden = false
    done.hidden = true
    backdrop.hidden = false
    fab.hidden = true
    refreshCounter()
    ;(shadow.querySelector('.type') as HTMLElement).focus()
  }

  function close(): void {
    if (backdrop.hidden || busy) return
    backdrop.hidden = true
    fab.hidden = false
    imageToken++
    if (!done.hidden) resetForm()
    ;(lastFocus as HTMLElement | null)?.focus?.()
    fab.focus()
  }

  async function onSubmit(e: Event): Promise<void> {
    e.preventDefault()
    if (busy) return
    const user = currentUser()
    if (!validate()) return
    if (!user || !issueType) return setError('No pudimos identificar tu sesión. Vuelve a iniciar sesión e inténtalo otra vez.')

    setError(null)
    busy = true
    submitBtn.disabled = true
    spinner.hidden = false
    label.textContent = 'Enviando…'
    sendingSub.textContent = imageBlob ? 'Subiendo la imagen adjunta, puede tardar unos segundos.' : 'Esto tomará solo un momento.'
    sending.hidden = false
    form.setAttribute('aria-busy', 'true')
    const slowTimer = window.setTimeout(() => {
      if (busy) sendingSub.textContent = 'Sigue en proceso, gracias por esperar…'
    }, 6000)
    try {
      const result = await submitReport(options.apiUrl, options.endpoint ?? '/tickets', {
        issueType,
        description: desc.value.trim(),
        system: options.system,
        user,
        context: collectContext(),
        screenshot: imageBlob,
        telemetry: getTelemetrySnapshot(),
      }, getApiKey(), options.fetch)
      // Acepta la respuesta de `/v1/pixibot/tickets` (ticket_code, user_message) y la forma `{ data: { id } }`.
      const r = result as { ticket_code?: string; user_message?: string; is_duplicate?: boolean; already_resolved?: boolean; data?: { id?: string } } | null
      const ticketId = r?.ticket_code ?? r?.data?.id
      shadow.querySelector('.done-msg')!.textContent =
        r?.already_resolved || r?.is_duplicate
          ? (r.user_message ?? 'El equipo ya está atendiendo este problema.')
          : ticketId
            ? `Tu reporte quedó registrado como ${ticketId}. El equipo ya fue notificado.`
            : (r?.user_message ?? 'El equipo ya fue notificado y lo revisará pronto. ¡Gracias por avisar!')
      form.hidden = true
      done.hidden = false
      ;(shadow.querySelector('.done-close') as HTMLElement).focus()
      options.onSubmitted?.(result)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('No se pudo enviar el reporte.')
      setError(
        error.message === 'Failed to fetch'
          ? 'No pude conectarme con el servidor. Revisa tu conexión e inténtalo de nuevo.'
          : error.message,
      )
      options.onError?.(error)
    } finally {
      window.clearTimeout(slowTimer)
      sending.hidden = true
      form.removeAttribute('aria-busy')
      busy = false
      submitBtn.disabled = false
      spinner.hidden = true
      label.textContent = 'Enviar reporte'
    }
  }

  /* ---------- Eventos ---------- */
  fab.addEventListener('click', open)
  bubble.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('.x')) hideBubble()
    else open()
  })
  $('.close').addEventListener('click', close)
  $('.cancel').addEventListener('click', close)
  $('.done-close').addEventListener('click', close)
  shadow.addEventListener('keydown', (e) => {
    const ev = e as KeyboardEvent
    if (ev.key === 'Escape' && !backdrop.hidden) {
      ev.stopPropagation()
      close()
    }
  })
  shadow.querySelectorAll<HTMLElement>('.type').forEach((b) =>
    b.addEventListener('click', () => {
      issueType = b.dataset.type as IssueType
      shadow.querySelectorAll('.type').forEach((o) => o.setAttribute('aria-checked', String(o === b)))
      setError(null)
      setFieldError(typeErr, null)
      typesBox.classList.remove('invalid')
    }),
  )
  shadow.querySelectorAll<HTMLElement>('.mode').forEach((b) =>
    b.addEventListener('click', () => {
      const next = b.dataset.mode as ImageMode
      if (next === mode && next !== 'upload') return
      setMode(next)
    }),
  )
  againBtn.addEventListener('click', () => (mode === 'screenshot' ? void takeScreenshot() : fileInput.click()))
  fileInput.addEventListener('change', () => void onFileChosen())
  fileInput.addEventListener('cancel', () => {
    if (!imageBlob) setMode('none')
  })
  desc.addEventListener('input', () => {
    refreshCounter()
    // Una vez mostrado el error, se actualiza en vivo hasta que se corrige.
    if (!descErr.hidden) {
      const m = descMessage()
      setFieldError(descErr, m, false) // sin re-animar mientras escribe
      desc.classList.toggle('invalid', !!m)
    }
  })
  desc.addEventListener('blur', () => {
    if (desc.value.length > 0 && descMessage()) {
      setFieldError(descErr, descMessage())
      desc.classList.add('invalid')
    }
  })
  form.addEventListener('submit', (e) => void onSubmit(e))

  document.body.append(host)
  const uninstallMonitor = installMonitor(options, currentUser, HOST_ID)
  if (options.monitor) {
    $('.privacy').textContent += ' Si el sistema falla, Pixibot avisará al equipo automáticamente.'
  }
  refreshCounter()
  hint.textContent = HINTS.none
  // El saludo aparece poco después de que el robot "entra" a la pantalla.
  // Solo una vez por sesión de usuario: no se repite al navegar ni al recargar.
  const greetKey = 'pixibot:greeted'
  const uid = String(currentUser()?.id ?? currentUser()?.name ?? '')
  let greeted = false
  try { greeted = sessionStorage.getItem(greetKey) === uid } catch { /* storage bloqueado */ }
  const greetTimer = window.setTimeout(() => {
    if (greeted) return
    try { sessionStorage.setItem(greetKey, uid) } catch { /* ignorar */ }
    showBubble()
  }, 1200)

  return {
    open,
    close,
    setUser(u) {
      userOverride = u
      if (!u) hideBubble()
    },
    destroy() {
      window.clearTimeout(greetTimer)
      window.clearTimeout(bubbleTimer)
      window.clearInterval(typingTimer)
      uninstallMonitor()
      clearImage()
      host.remove()
    },
  }
}
