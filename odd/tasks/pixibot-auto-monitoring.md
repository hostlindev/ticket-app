# Monitoreo Automático de Errores en el Widget Pixibot (ODD)

Locator: `odd/tasks/pixibot-auto-monitoring.md`
Objective: Que `@pixi/pixibot-widget`, además del reporte manual, detecte en segundo plano los errores HTTP 5xx, los códigos Oracle `ORA-NNNNN` y los errores de ejecución del frontend del sistema anfitrión, y los envíe sin bloquear ni interrumpir al usuario. Los envíos se agrupan con *cooldown* y se limpian de datos sensibles antes de salir del navegador.
Branch sugerida: `feat/pixibot-auto-monitoring` (desde `dev`) | Delivery strategy: `ask-on-risk` | Test runner: `vitest` + `happy-dom` (propuesto, ver T1) + `pnpm build:widget` + `pnpm build`
Forecast: ~700 líneas nuevas en `packages/pixibot-widget/src/telemetry/**` y tests, ~80 modificadas en `types.ts`, `submit.ts`, `widget.ts` e `index.ts`, ~20 en el anfitrión (`src/core/composables/usePixibot.ts`, `src/main.ts`, `.env.example`).
Estado: **IMPLEMENTADO en `feat/pixibot-auto-monitoring` (sin commit). Pendiente: backend `ticket-api` y verificación manual en navegador.**

## Specs

- **S1**: "Necesito que evalues este plan y me planifiques los ajustes que se deben realizar en el widget de pixibot." (plan pegado: *Especificación de Implementación: Monitoreo Automático en Widget Pixibot*).
  - Alcance autorizado: evaluar el plan contra el código real y planificar los cambios en `packages/pixibot-widget/` y en el punto donde lo integra el anfitrión (`src/core/composables/usePixibot.ts`, `src/main.ts`).
  - Criterios de aceptación: se conservan los 4 criterios del plan original (ver *Acceptance Criteria*), con las correcciones de la evaluación.
- **S2**: "Crea la tarea en ODD y la guardes en odd/tasks/ para implementar y me avisas."
  - Alcance autorizado: crear este documento. Ningún cambio de código hasta recibir autorización.
  - Criterios de aceptación: archivo creado, checklist con `[ ]`, aviso al usuario.

## Evaluación del plan original

El objetivo y la estrategia general sirven: interceptar y analizar en segundo plano, *cooldown* por firma, `keepalive`, snapshot de telemetría para el reporte manual y envoltura del `errorHandler` de Vue sin perder el anterior. El plan **no se puede aplicar tal cual**: se escribió para una estructura de paquete que no es la nuestra y falla en varios puntos al cruzarlo con el widget y con `ticket-api`.

### Bloqueantes

| # | Hallazgo | Evidencia | Ajuste |
|---|----------|-----------|--------|
| B1 | El endpoint `POST /api/v1/pixibot/incidents/auto` **no existe**. Solo existe `POST /v1/pixibot/tickets`. Ese endpoint exige `description` (mín. 10), `reporter_data.id/name` y un `error_type` del enum, así que rechazaría `http_5xx`, `oracle_error` y `frontend_error`. | `ticket-api/routes/api.php:78-81`, `StorePixibotTicketRequest::rules()` | Dependencia de backend (sección *Dependencia backend*). El widget queda preparado con un endpoint configurable. |
| B2 | La cabecera es `X-System-Key`, no `X-System-Token`. CORS solo permite `X-System-Key`. | `PixibotIngestionController.php:22`, `config/cors.php` (`allowed_headers`) | Usar `X-System-Key`. |
| B3 | El widget **hoy no envía ninguna API key**: el reporte manual contra la API real responde 403 (`resolveSystemByApiKey`). | `submit.ts:32-33` solo pone `Authorization: Bearer` | Nueva opción `apiKey` en `PixibotOptions`, enviada en los dos flujos. |
| B4 | El anfitrión hace sus peticiones con **axios, que usa `XMLHttpRequest`**. Un interceptor que solo envuelve `fetch` no ve ningún error en ticket-app ni en cualquier sistema con axios. El plan además descarta los rechazos de axios (`isAxiosError`), así que esos errores no se capturan por ningún lado. | `src/core/api/http.ts` (`axios.create`) | Interceptar también `XMLHttpRequest` (`open`/`send` + `loadend`). |
| B5 | Bucle de auto-reporte: `submitReport` usa el `fetch` global (`fetcher = fetch`, que se evalúa en cada llamada) y el plan envía el incidente con ese mismo `window.fetch` ya parcheado. Si la API de Pixibot responde 5xx, se reporta a sí misma. | `submit.ts:18`, plan §4 `dispatchAutoIncident` | Guardar el `fetch` nativo al instalar el monitor y usarlo en el despacho. Ignorar siempre las URLs de `apiUrl`. |
| B6 | Si el interceptor lanza una excepción, rompe el `fetch` del anfitrión. Por ejemplo, `new URL(rawUrl, …)` lanza con entradas raras y el análisis corre antes del `return response`. | plan §4 `hookFetch` | Todo el análisis va en `try/catch` y en una microtarea. La respuesta original vuelve siempre e inmediatamente. |
| B7 | El interceptor hace `await cloned.text()` **antes** de devolver la respuesta. Así retrasa todas las respuestas 4xx/5xx del anfitrión y puede colgarse con respuestas en streaming. | plan §4 | Leer el clon en segundo plano (sin `await` en el camino del anfitrión), con límite de tamaño y solo para `content-type` JSON o texto. |
| B8 | Contradicción: el criterio 2 pide detectar `ORA-` en respuestas **200**, pero el código solo analiza `status >= 400`. | plan §4 vs §7.2 | Opción `scanSuccessBodies` (por defecto `true`) limitada a JSON/texto de hasta 64 KB. |
| B9 | `sanitizeText` corta a 500 caracteres **antes** de buscar `ORA-`, así que se pierde un código que aparezca más adelante en el cuerpo. | plan §3 `inspectResponsePayload` | Buscar `ORA-` en el cuerpo crudo (acotado) y luego sanitizar y recortar el extracto. |

### Desalineaciones con el paquete real

| # | Plan | Realidad | Ajuste |
|---|------|----------|--------|
| D1 | Archivos `.js`, `PixibotModal.vue`, `Pixibot.init()` | El paquete es **TypeScript estricto, vanilla, en Shadow DOM**. La API es `initPixibot()` → `PixibotHandle` y no hay componentes Vue (`widget.ts`, `index.ts`). | Módulos `.ts` en `src/telemetry/`. Integración en `widget.ts` y `submit.ts`. El paquete no depende de Vue. |
| D2 | `systemName`, `apiKey`, `user` como objeto | Las opciones existentes son `system`, `user` (objeto **o función**) y `token`. | Reutilizar `system` y el getter `currentUser()`. Con el plan, si `user` es una función, `reporter_data` se serializa vacío. |
| D3 | `${apiUrl}/api/v1/…` | En el anfitrión `apiUrl` ya es `…/api` (`VITE_API_URL ?? '/api'`), y el plan duplicaría `/api`. | Ruta relativa a `apiUrl`, configurable (`monitor.endpoint`, por defecto `/v1/pixibot/incidents/auto`). |
| D4 | `setUser` muta `currentConfig`, pero el tracker guardó una copia con spread | El usuario no se propaga al tracker. | El monitor lee el usuario con el mismo getter del widget (`currentUser`), que respeta `handle.setUser()`. |
| D5 | Sin desinstalación | `usePixibot` llama a `initPixibot` en cada login y a `destroyPixibot` en cada logout. Con el plan, `fetch` se envolvería N veces y los listeners se duplicarían. | `installMonitor()` idempotente que devuelve `uninstall()`. `destroy()` restaura `fetch`/XHR solo si el wrapper sigue siendo el nuestro. Si no, lo deja como paso directo. |
| D6 | Click: `closest('#pixibot-widget')` | El host se llama `#pixibot-widget-host` (`widget.ts:21`). | Comparar con el elemento host (el evento se re-dirige a él desde el Shadow DOM). |
| D7 | Firma de *cooldown* `route|code` | Con `code = HTTP_500`, todos los 500 de una ruta se agrupan aunque vengan de endpoints distintos. El backend agrupa por `endpoint+status` (`TicketTriageService::generateFingerprint`). | Firma alineada con el backend: `NET|route|method endpoint|status|ora`, `JS|route|mensaje[0..80]`. |
| D8 | Telemetría manual "en FormData" | El backend ya acepta `telemetry[...]` y `client[...]`, y `detectLayer` usa `http_status` y `js_error`. | Enviar `telemetry[http_status]`, `telemetry[failed_endpoint]`, `telemetry[ora_code]`, `telemetry[js_error]` y `telemetry[last_ui_action]` solo si tienen valor. |

### Riesgos de privacidad, ruido y rendimiento

- **Redacción insuficiente.** El regex del plan no cubre JSON (`"password":"x"`), `Authorization: …`, JWT (`eyJ…`), `api_key`, `access_token`, cadenas de conexión Oracle (`user/pass@host:1521/SID`) ni correos. Hay que ampliar los patrones y cubrirlos con tests.
- **Etiqueta del último clic.** `innerText` provoca un reflow en cada clic y puede capturar PII (nombres, montos). Se usa, en este orden: `data-pixibot-label`, `id`, `aria-label`, `name` y `textContent` recortado. Nunca el `value` de un input.
- **Ruido en `window.error`.** Hay que filtrar `Script error.` (cross-origin sin información), los errores de extensiones (`chrome-extension://`, `moz-extension://`) y `ResizeObserver loop …`.
- **Tormentas de envíos.** Con el backend caído, cada endpoint genera una firma distinta. Se añade un tope global (`maxPerMinute`, por defecto 10). El *cooldown* se guarda en `sessionStorage` para que una recarga no lo reinicie.
- **Vue silenciado.** Al asignar `app.config.errorHandler`, Vue deja de imprimir el error en consola. Si no había un handler previo, el wrapper hace `console.error(err)`.
- **Opt-in.** El monitoreo automático se activa con `monitor` explícito. Por defecto queda apagado, para no cambiar el comportamiento de los sistemas que ya instalaron el widget. El texto de privacidad del modal menciona los datos técnicos.
- **`keepalive`.** El cuerpo tiene un límite de 64 KB, así que el payload se recorta (mensaje ≤ 500 y telemetría acotada).
- **Rutas.** `normalizePath` no colapsa ULID/`public_id` ni hashes largos. Se agrega `/[0-9A-HJKMNP-TV-Z]{26}` y `/[0-9a-f]{24,}` → `/:id` para no multiplicar firmas.

### Dependencia backend (fuera del alcance de esta tarea, repo `apis/ticket-api`)

Sin esto el envío automático responde 404. El widget lo tolera en silencio, pero no se registra nada.

1. `POST /v1/pixibot/incidents/auto` con su propio FormRequest. Autorización por `X-System-Key`. `error_type ∈ {http_5xx, oracle_error, frontend_error}`. `reporter_data` opcional. `description` derivada de `error_message`. `code`, `telemetry` y `occurred_at`.
2. `throttle` por sistema e IP en ese endpoint.
3. `detectLayer`: con `ora_code`, capa `base_datos` (hoy, un ORA con status 200 cae en `por_definir`). `generateFingerprint`: incluir `ora_code` en la firma.
4. CORS: hoy `allowed_origins` solo admite `FRONTEND_URL`. El widget instalado en **otro** sistema queda bloqueado en los dos flujos. Habría que admitir los `domain` registrados de cada sistema.
5. Se recomienda una tarea ODD propia en `ticket-api/odd/tasks/`.

### Diseño objetivo

```text
packages/pixibot-widget/src/
├── telemetry/
│   ├── sanitize.ts      # redactSecrets(), sanitizeText(max), normalizePath()
│   ├── detect.ts        # ORA_REGEX, inspectPayload(status, body, contentType)
│   ├── state.ts         # último error de red/JS, última acción UI, getTelemetrySnapshot()
│   ├── dispatch.ts      # firma, cooldown (Map + sessionStorage), tope global, envío con fetch nativo
│   ├── hooks/
│   │   ├── fetch.ts     # wrapper no bloqueante de window.fetch
│   │   ├── xhr.ts       # parche de XMLHttpRequest.open/send (axios)
│   │   ├── errors.ts    # window 'error' + 'unhandledrejection' con filtros
│   │   └── clicks.ts    # última acción UI (captura, sin PII)
│   └── index.ts         # installMonitor(ctx) → uninstall(); captureError(); attachVue()
├── types.ts             # + apiKey, appVersion, monitor: PixibotMonitorOptions
├── submit.ts            # + X-System-Key, telemetry[...]
├── widget.ts            # snapshot al enviar, texto de privacidad, instala/desinstala el monitor
└── index.ts             # exporta captureError, attachVue, getTelemetrySnapshot
```

Opciones nuevas (contrato público):

```ts
interface PixibotOptions {
  // …existentes
  apiKey?: string                        // → X-System-Key (manual y automático)
  appVersion?: string
  monitor?: boolean | PixibotMonitorOptions // omitido/false = apagado
}

interface PixibotMonitorOptions {
  endpoint?: string           // por defecto '/v1/pixibot/incidents/auto'
  network?: boolean           // 5xx (fetch + XHR). Por defecto true
  oracle?: boolean            // ORA- en cuerpos 4xx/5xx. Por defecto true
  scanSuccessBodies?: boolean // ORA- también en 2xx JSON/texto ≤ 64 KB. Por defecto true
  frontend?: boolean          // window.error / unhandledrejection / Vue. Por defecto true
  cooldownMs?: number         // por defecto 300_000
  maxPerMinute?: number       // por defecto 10
  ignoreUrls?: Array<string | RegExp> // además de apiUrl, que siempre se ignora
}

// API pública adicional
export function captureError(error: unknown, meta?: { code?: string; component?: string; info?: string }): void
export function attachVue(app: { config: { errorHandler?: (err: unknown, instance: unknown, info: string) => void } }): void
export function getTelemetrySnapshot(): TelemetrySnapshot
```

Payload automático (JSON, `keepalive: true`, `X-System-Key`):

```json
{
  "system_name": "Pixibot",
  "app_version": "1.4.0",
  "source": "pixibot-auto",
  "error_type": "http_5xx | oracle_error | frontend_error",
  "code": "HTTP_500 | ORA-00942 | JS_ERROR | UNHANDLED_REJECTION | VUE_ERROR",
  "error_message": "≤500 caracteres, sanitizado",
  "module_route": "/tickets/:id",
  "user_agent": "…",
  "occurred_at": "2026-11-21T15:04:05.000Z",
  "reporter_data": { "id": "…", "name": "…", "email": "…" },
  "telemetry": {
    "http_status": 500, "http_method": "POST", "failed_endpoint": "/api/tickets/:id",
    "ora_code": null, "js_error": null, "source": null,
    "vue_component": null, "lifecycle_hook": null, "last_ui_action": "button:#save"
  }
}
```

## Tasks

- [x] T1 (`S1`, route: `inline`) — **Base de pruebas.** Agregar `vitest` y `happy-dom` como devDependencies de `packages/pixibot-widget`, más el script `test`. Es una dependencia nueva, así que hay que confirmarla al autorizar. Si se rechaza, T2–T7 se verifican con el build y la verificación manual de T9.
- [x] T2 (`S1`, route: `inline`) — **Contrato y API key.** En `types.ts`: `apiKey`, `appVersion`, `monitor` y `PixibotMonitorOptions`, `TelemetrySnapshot`, `AutoIncident`. En `submit.ts`: enviar `X-System-Key` cuando haya `apiKey` (B2, B3). Sin cambios de comportamiento si no se configura.
- [x] T3 (`S1`, route: `inline`) — **`telemetry/sanitize.ts` y `telemetry/detect.ts`.** Redacción ampliada (bearer, `token=`, `password`/`secret`/`api_key`/`access_token` en query y JSON, `Authorization`, JWT, cadenas de conexión Oracle, correos), `normalizePath` (uuid, numérico, ULID, hex) e `inspectPayload` (ORA sobre el cuerpo crudo acotado y después el extracto sanitizado; B9). Tests unitarios de cada patrón.
- [x] T4 (`S1`, route: `inline`) — **`telemetry/state.ts` y `telemetry/dispatch.ts`.** Estado en memoria con ventana de 120 s para el snapshot. Firma alineada con el backend (D7), *cooldown* en `Map` + `sessionStorage`, tope `maxPerMinute`, envío con el **fetch nativo guardado** o con `options.fetch` (mock), `keepalive`, `X-System-Key`, payload recortado a menos de 60 KB, errores silenciados (B5). Tests: duplicado dentro de 5 min = 1 envío; tope global; sin `apiKey`/`apiUrl` = no envía.
- [x] T5 (`S1`, route: `inline`) — **Interceptores de red** `hooks/fetch.ts` y `hooks/xhr.ts`. Devuelven la respuesta original al instante. El análisis va en segundo plano con `try/catch` total (B6, B7). Se ignoran las URLs de `apiUrl` y de `ignoreUrls`. Se lee el cuerpo solo si el `content-type` es JSON o texto y pesa ≤ 64 KB. Para 2xx solo con `scanSuccessBodies` (B8). XHR: `responseType` `''`/`text`/`json` vía `loadend` (B4). Tests con `fetch` simulado y XHR de happy-dom: 500 → `http_5xx`; 200 con `ORA-00942` → `oracle_error`; 4xx sin ORA → solo estado, sin envío; si el interceptor lanza, el anfitrión igual recibe su respuesta.
- [x] T6 (`S1`, route: `inline`) — **Errores de frontend y Vue** (`hooks/errors.ts`, `captureError`, `attachVue`). Filtros de ruido (Script error, extensiones, ResizeObserver). `unhandledrejection` ignora los rechazos HTTP ya capturados por T5 (axios `isAxiosError` con `response`) y captura el resto. `attachVue` envuelve el handler previo y, si no había, hace `console.error`. Tipado estructural, sin importar `vue`. Tests de los tres caminos.
- [x] T7 (`S1`, route: `inline`) — **Última acción UI y ciclo de vida** (`hooks/clicks.ts`, `telemetry/index.ts`). Clic en fase de captura, que ignora el host del widget (D6), con etiqueta sin PII y `textContent`. `installMonitor` es idempotente con `uninstall()` que restaura `fetch`/XHR solo si siguen siendo nuestros (D5). Integrarlo en `mountPixibot`: instala si `options.monitor` y desinstala en `destroy()`. Lee el usuario con `currentUser()` (D4). Test: llamar init→destroy→init no duplica wrappers ni listeners.
- [x] T8 (`S1`, route: `inline`) — **Reporte manual con telemetría** (`widget.ts`, `submit.ts`). Al enviar, adjuntar `getTelemetrySnapshot()` como `telemetry[...]`, solo con los campos que tienen valor (D8). Actualizar el texto de privacidad del modal cuando `monitor` está activo. Exportar `captureError`, `attachVue` y `getTelemetrySnapshot` desde `index.ts`.
- [x] T9 (`S1`, route: `inline`) — **Integración en el anfitrión ticket-app.** En `usePixibot.ts`: `apiKey: import.meta.env.VITE_PIXIBOT_KEY` y `monitor: true` (o tomado de env). En `main.ts`: `attachVue(app)`. En `env.d.ts` y `.env.example`: `VITE_PIXIBOT_KEY`. En modo mock, el despacho usa `mockFetch` y no sale a la red. Verificación manual en `pnpm dev`: forzar un 500, un ORA en un 200 y un `TypeError`, y revisar en DevTools → Network los POST automáticos y el *cooldown*.
- [x] T10 (`S1-S2`, route: `inline`) — **Verificación final.** `pnpm --filter @pixi/pixibot-widget test`, `pnpm build:widget` (vite + `tsc` de declaraciones) y `pnpm build` (type-check del anfitrión). Revisar que el bundle no importe `html2canvas-pro` de forma estática (sigue siendo dinámico) y anotar el tamaño de `dist/pixibot.js` antes y después.

## Acceptance Criteria

1. **HTTP 5xx:** una respuesta con status 500, por `fetch` **o por axios/XHR**, genera un único `POST {apiUrl}/v1/pixibot/incidents/auto` con `error_type = 'http_5xx'`, `code = 'HTTP_500'`, `telemetry.http_status = 500` y `telemetry.failed_endpoint` normalizado. La respuesta llega al anfitrión sin demora ni alteraciones.
2. **Oracle `ORA-`:** una respuesta 200, 4xx o 5xx cuyo cuerpo JSON o de texto contenga `ORA-00942` (aunque esté pasado el carácter 500) genera `error_type = 'oracle_error'` y `telemetry.ora_code = 'ORA-00942'`.
3. **Frontend:** un `TypeError` no capturado, una promesa rechazada sin manejar o un error en un componente Vue (vía `attachVue`) genera `error_type = 'frontend_error'` con `telemetry.js_error` poblado. El handler previo de Vue se sigue ejecutando.
4. **Cooldown y sanitización:** el mismo error repetido dentro de 5 minutos (incluso después de recargar) no se reenvía, y nunca salen más de `maxPerMinute` envíos por minuto. Tokens, contraseñas, JWT, API keys y credenciales Oracle aparecen como `[REDACTED]`.
5. **No regresión:** sin `monitor`, el widget se comporta exactamente igual que hoy (aparte de `X-System-Key` cuando hay `apiKey`). Los errores en Pixibot (incluida su propia API caída) nunca generan auto-reportes ni excepciones visibles en el anfitrión. Repetir init/destroy no duplica wrappers.
6. **Build:** `pnpm build:widget` y `pnpm build` terminan sin errores y las pruebas de T1–T7 pasan.

## Log

- **L1 (2026-11-21)**: "Necesito que evalues este plan […] y me planifiques los ajustes que se deben realizar en el widget de pixibot. Adicional necesito que crees la tarea en ODD y la guardes en odd/tasks/ para implementar y me avisas."
- **L2 (2026-11-21)**: Exploración de `packages/pixibot-widget/src/*` (TS vanilla, Shadow DOM, sin tests), `src/core/composables/usePixibot.ts` y `src/core/api/http.ts` (axios) en el anfitrión, y `apis/ticket-api` (`routes/api.php`, `PixibotIngestionController`, `StorePixibotTicketRequest`, `TicketService::ingestFromPixibot`, `TicketTriageService`, `config/cors.php`). Resultado: 9 bloqueantes, 8 desalineaciones y la dependencia de backend documentadas arriba. Plan de 10 tareas creado. Implementación en pausa hasta autorización explícita.
- **L3 (2026-11-21)**: "Necesito que ejecutes el plan de odd/tasks/ y luego de implementar guardes la memoria en engram" — autorización de implementación. Rama `feat/pixibot-auto-monitoring`. T1–T10 completadas: `vitest`+`happy-dom` añadidos, módulos `src/telemetry/**`, `apiKey`→`X-System-Key`, telemetría en reporte manual, `attachVue(app)` y `VITE_PIXIBOT_KEY` en el anfitrión. Evidencia: 25 pruebas OK, `pnpm build:widget` OK (`pixibot.js` 45.28 kB, gzip 14.64 kB), `pnpm build` OK. Pendiente: T9 verificación manual en navegador (requiere backend con el endpoint `/v1/pixibot/incidents/auto`) y tarea ODD de `ticket-api`. Engram no está disponible en el entorno: memoria guardada en la memoria de Claude Code del proyecto.
- **L4 (2026-11-21)**: "Ahora necesito que hagas la revision de lo implementado…" — revisión del código con correcciones:
  1. **Crítico**: el filtro anti-bucle ignoraba todo `apiUrl`. En ticket-app la API del sistema y la de Pixibot comparten `VITE_API_URL`, así que el monitor no veía ningún error del anfitrión. Además, con `apiUrl` relativa (`/api`) no ignoraba nada. Ahora se ignoran solo los endpoints de Pixibot (manual + automático), resueltos a URL absoluta (`ctx.ownUrls`).
  2. El hook de `fetch` hacía `clone().text()` sin límite, incluso en `text/event-stream`: SSE y respuestas grandes quedaban en memoria indefinidamente. Ahora la lectura está acotada a 64 KB con `reader.cancel()` y excluye SSE/ndjson. XHR también filtra por `content-type` y recorta.
  3. Cortar el JSON del despacho a 60 KB producía JSON inválido (422). Ahora se acotan los campos (`module_route` y `failed_endpoint` ≤255).
  4. `unhandledrejection` reportaba como `frontend_error` los errores HTTP que el anfitrión normaliza como objetos planos (`normalizeApiError` de ticket-app), duplicando los 5xx y añadiendo ruido con los 4xx. Ahora solo reporta `Error`/string, sin `AbortError` ni axios.
  5. El clic sobre un contenedor leía `textContent` de todo su subárbol (costoso y con posible PII). Ahora solo en botones y enlaces, y redactado.
  6. Un ORA en una respuesta 2xx no quedaba en el snapshot del reporte manual. Corregido.
  7. El reporte manual enviaba `telemetry[last_ui_action]=none` y alteraba la firma `UI` del backend. Ahora se omite.
  8. `captureError` con objetos producía `[object Object]`. Ahora usa `JSON.stringify`.
  9. Reporte manual: el host apunta a `/v1/pixibot/tickets` y el widget lee `ticket_code` / `user_message` / `is_duplicate` / `already_resolved` (antes solo `data.id`).
  Evidencia: 32 pruebas OK (7 nuevas de regresión), `pnpm build` OK. Plan de backend en `odd/tasks/pixibot-backend-auto-incidents.md`.
