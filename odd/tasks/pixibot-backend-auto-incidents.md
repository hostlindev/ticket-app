# Backend: recepción de incidentes automáticos de Pixibot (ODD)

Locator: `odd/tasks/pixibot-backend-auto-incidents.md` (redactado desde ticket-app; se implementa en `apis/ticket-api`)
Objective: Que `ticket-api` reciba, valide, clasifique y deduplique los incidentes que el widget Pixibot envía solo (HTTP 5xx, códigos Oracle `ORA-`, errores de frontend), y que aproveche la telemetría que ahora llega con los reportes manuales, sin saturar la base ni la cola de soporte.
Branch sugerida: `feat/pixibot-auto-incidents` | Test runner: Pest (`php artisan test --filter=Pixibot`) | Depende de: `odd/tasks/pixibot-auto-monitoring.md` (widget ya implementado).
Estado: **PLANIFICADO. Pendiente de autorización para implementar en `ticket-api`.**

## Specs

- **S1**: "Realices el plan en .md para darle las instrucciones de lo que necesita el backend para recibir estos datos."
  - Alcance: endpoint nuevo, validación, mapeo a `tickets`, capa y firma para Oracle, límite de peticiones, CORS para sistemas externos y pruebas. Sin cambios en el widget.
  - Criterios de aceptación: ver *Acceptance Criteria*.

## Contexto (estado actual de `ticket-api`)

| Pieza | Estado | Archivo |
|-------|--------|---------|
| `POST /api/v1/pixibot/tickets` (reporte manual) | Existe. Se autentica con `X-System-Key` | `routes/api.php:78-81`, `PixibotIngestionController` |
| `POST /api/v1/pixibot/incidents/auto` | **No existe**. Hoy el widget recibe 404 y lo descarta en silencio | — |
| Validación manual | Exige `description` (mín. 10), `reporter_data.id/name` y `error_type` del enum `IssueType` | `StorePixibotTicketRequest::rules()` |
| Capa | `backend` (≥500), `integracion` (400/404/405/422 o JS con 200), `frontend` (JS sin status), `por_definir`. **No contempla Oracle** | `TicketTriageService::detectLayer()` |
| Firma | `NET` (ruta + endpoint + status), `JS` (ruta + mensaje[0..80]) o `UI` | `TicketTriageService::generateFingerprint()` |
| Deduplicación | Busca un padre activo, o resuelto hace menos de 48 h, y crea un hijo `Duplicate` que incrementa `occurrences_count` | `TicketService::ingestFromPixibot()` |
| Columna `layer` | `string(30)` desde la migración unificada, así que admite valores nuevos sin migración | `2026_11_19_000001_unify_helpdesk_tickets_into_tickets.php:30` |
| CORS | `allowed_origins` = solo `FRONTEND_URL`. El widget instalado en **otro** sistema queda bloqueado en el navegador | `config/cors.php` |
| Rate limit | Solo `throttle:login` | `AppServiceProvider::boot()` |

## Contrato que envía el widget

### A. Incidente automático (nuevo)

`POST {VITE_API_URL}/v1/pixibot/incidents/auto` → con la configuración actual: `POST /api/v1/pixibot/incidents/auto`

- Cabeceras: `Content-Type: application/json`, `Accept: application/json`, `X-System-Key: <api_key del sistema>`.
- Se envía con `fetch(..., { keepalive: true })`: el navegador limita el cuerpo a 64 KB y la petición puede llegar después de que el usuario cierre la pestaña.
- No va `Authorization`: el incidente se identifica solo por el sistema.
- El widget **ignora la respuesta** (cualquier status), así que no hace falta un `user_message`.
- Antes de enviar, el widget ya limpia credenciales (`[REDACTED]`), recorta `error_message` y `js_error` a 500 caracteres y `module_route` y `failed_endpoint` a 255, y no repite la misma firma durante 5 minutos (tope de 10 envíos por minuto y pestaña).

```json
{
  "system_name": "Pixibot",
  "app_version": "1.4.0",
  "source": "pixibot-auto",
  "user_agent": "Mozilla/5.0 …",
  "occurred_at": "2026-11-21T15:04:05.000Z",
  "reporter_data": { "id": 12, "name": "Ana Pérez", "email": "ana@empresa.com" },
  "error_type": "oracle_error",
  "code": "ORA-00942",
  "error_message": "{\"message\":\"ORA-00942: la tabla o vista no existe\"}",
  "module_route": "/tickets/:id",
  "telemetry": {
    "http_status": 500,
    "http_method": "POST",
    "failed_endpoint": "/api/tickets/:id",
    "ora_code": "ORA-00942",
    "last_ui_action": "button:guardar"
  }
}
```

| Campo | Tipo / límite | Notas |
|-------|---------------|-------|
| `system_name` | string ≤100, nullable | Solo informativo: el sistema **siempre** se resuelve por `X-System-Key` |
| `app_version` | string ≤50, nullable | |
| `source` | `pixibot-auto` | Guardar en `telemetry.source` |
| `user_agent` | string ≤500, nullable | Si falta, usar `$request->userAgent()` |
| `occurred_at` | ISO-8601, nullable | Hora del cliente. Guardar en telemetría, **no** sustituir `created_at` |
| `reporter_data` | objeto **nullable** | `null` si no hay sesión. Si viene: `id` (nullable), `name` (requerido), `email` (nullable, email) |
| `error_type` | `http_5xx` \| `oracle_error` \| `frontend_error` | |
| `code` | string ≤40 | `HTTP_500`, `ORA-00942`, `JS_ERROR`, `UNHANDLED_REJECTION`, `VUE_ERROR`, `CAPTURED_ERROR` |
| `error_message` | string ≤500, requerido | Ya sanitizado. El backend vuelve a sanitizar (ver T3) |
| `module_route` | string ≤255, requerido | Ruta de la pantalla, ya normalizada (`/:id`, `/:uuid`) |
| `telemetry` | objeto, requerido | Claves de abajo. Todas son nullable |
| `telemetry.http_status` | int 100–599 | Solo en `http_5xx` y `oracle_error`. Puede ser 200 en un `oracle_error` |
| `telemetry.http_method` | string ≤10 | |
| `telemetry.failed_endpoint` | string ≤255 | Ruta del endpoint que falló, normalizada |
| `telemetry.ora_code` | regex `^ORA-\d{4,5}$` | |
| `telemetry.js_error` | string ≤500 | Solo en `frontend_error` |
| `telemetry.source` | string ≤200 | Archivo JS del error |
| `telemetry.vue_component` / `telemetry.lifecycle_hook` | string ≤100 | Solo en `VUE_ERROR` |
| `telemetry.last_ui_action` | string ≤100 | Último clic (`tag:etiqueta`) |

### B. Reporte manual (cambios que ya envía el widget)

`POST /api/v1/pixibot/tickets` (multipart). El host ticket-app ahora apunta aquí explícitamente. Novedades:

- Cabecera `X-System-Key` (antes no se enviaba y el endpoint respondía 403).
- `telemetry[http_status]`, `telemetry[failed_endpoint]`, `telemetry[ora_code]`, `telemetry[js_error]` y `telemetry[last_ui_action]`, solo los que tienen valor. Corresponden al último error ocurrido **en los 2 minutos previos** al reporte. En multipart llegan como **string**: `detectLayer` ya hace el cast a `int`.
- El widget ahora lee `ticket_code`, `user_message`, `is_duplicate` y `already_resolved` de la respuesta (forma actual de `PixibotIngestionController`). No hay que cambiar nada.

Ventaja: como el reporte manual lleva la misma telemetría (`failed_endpoint` + `http_status`, o `js_error`) que el incidente automático previo, `generateFingerprint` les da **la misma firma**. El reporte del usuario queda agrupado con el incidente que el widget ya había registrado.

## Tasks

- [ ] T1 — **Ruta y límite de peticiones.**
  - En `routes/api.php`, dentro del grupo `v1/pixibot`: `Route::post('/incidents/auto', [PixibotAutoIncidentController::class, 'store'])->middleware('throttle:pixibot-auto')->name('v1.pixibot.incidents.auto')`.
  - En `AppServiceProvider::boot()`: `RateLimiter::for('pixibot-auto', fn (Request $r) => Limit::perMinute(60)->by(sha1((string) $r->header('X-System-Key')).'|'.$r->ip()))`. Responde 429 y el widget lo ignora.
  - Aplicar también un `throttle` (p. ej. 20/min por key+IP) a `/v1/pixibot/tickets`.
  - La API key va en el bundle JS del sistema, así que es **pública**: el límite de peticiones es la defensa real contra abusos.
- [ ] T2 — **FormRequest `StorePixibotAutoIncidentRequest`** (`app/Modules/Helpdesk/Requests/`).
  - `authorize()`: igual que el manual, con `resolveSystemByApiKey($this->header('X-System-Key'))`, que lanza 403 si falta la key, es inválida o el sistema está borrado (SoftDeletes ya lo excluye).
  - `rules()`: las de la tabla del contrato A. `error_type` con `Rule::in(['http_5xx','oracle_error','frontend_error'])` y `reporter_data` como `nullable|array` (`reporter_data.name` con `required_with:reporter_data`).
  - Rechazar cuerpos mayores de 16 KB con 413, ya sea en el FormRequest o en un middleware ligero sobre `Content-Length`.
  - No reutilizar `StorePixibotTicketRequest`: sus reglas (descripción mín. 10, reporter obligatorio, enum `IssueType`) no aplican aquí.
- [ ] T3 — **Servicio `TicketService::ingestAutoIncident(array $data, System $system, string $ip, ?string $ua): array`**, reutilizando `TicketTriageService`:
  1. `normalizeRoute($data['module_route'])`.
  2. Telemetría guardada = `$data['telemetry']` + `source`, `auto: true`, `code`, `app_version`, `occurred_at` y `error_type`.
  3. **Volver a sanitizar** `error_message` y `js_error` en el servidor (defensa en profundidad), con los mismos patrones del widget: `bearer|basic <x>`, `password|secret|token|api_key|access_token=…`, JSON `"password":"…"`, JWT `eyJ….….…`, cadenas Oracle `user/pass@host:puerto/SID` y correos.
  4. Mapeo a `IssueType` y severidad (**decisión del equipo**, ver *Decisiones*). Recomendación: `http_5xx` → `not_working` (P2), `oracle_error` → `not_working` (P2), `frontend_error` → `other` (P4).
  5. `description` = `"[Automático] {code} en {module_route}: {error_message}"`, así siempre supera los 10 caracteres y se distingue en el listado.
  6. Reporter: si `reporter_data` es `null`, usar `reporter_name = 'Pixibot (automático)'`, `reporter_external_id = null` y `reporter_email = 'pixibot@ticket.local'` (el mismo fallback que ya existe).
  7. `fingerprint` y `findExistingParent` exactamente como en el manual, para que los reportes manuales y automáticos se agrupen entre sí.
  8. **Duplicados automáticos**: si existe un padre, **no crear fila hija**. Solo `increment('occurrences_count')` y `touch()`. Un error repetido por cientos de usuarios generaría cientos de filas `Duplicate`. Los reportes manuales siguen creando hijo como hoy.
  9. Sin padre: crear el ticket `Open` con `sla_due_at` según la severidad, `layer = detectLayer($telemetry)`, `browser` vía `resolveBrowser` e `ip_address`.
  10. Todo dentro de `DB::transaction` con `lockForUpdate()` sobre el padre. Si no, dos incidentes simultáneos con la misma firma crean dos padres.
- [ ] T4 — **Controlador `PixibotAutoIncidentController`** (`app/Modules/Helpdesk/Controllers/`). Responde `202 Accepted` con `{ "accepted": true, "ticket_code": "...", "is_duplicate": bool }`. Sin `user_message`. Los errores de autorización y validación usan los handlers existentes (403 `ERR_FORBIDDEN`, 422).
- [ ] T5 — **Capa y firma para Oracle** (`TicketTriageService`).
  - `detectLayer()`: **primera regla**, si `!empty($telemetry['ora_code'])` → `'base_datos'`. Así un ORA con status 200, que hoy cae en `por_definir`, y uno con 500, que hoy cae en `backend`, quedan bien clasificados. Aplica también a los reportes manuales que traigan `telemetry[ora_code]`.
  - `generateFingerprint()`: en la rama `NET`, añadir `|{ora_code}` **solo si no está vacío**. Las firmas existentes no cambian y dos ORA distintos en el mismo endpoint dejan de agruparse.
  - Revisar cualquier lista cerrada de capas (filtros del dashboard, `TicketResource`, enums o validaciones de filtros) y añadir `base_datos`. El frontend de ticket-app hoy no tiene etiquetas de capa hardcodeadas.
- [ ] T6 — **CORS para sistemas externos.** Hoy solo `FRONTEND_URL` puede llamar desde el navegador, así que el widget en otro dominio falla en el *preflight* (manual y automático). Opciones, de la más simple a la más estricta:
  1. **Recomendada**: middleware propio `PixibotCors`, añadido al inicio del stack global y aplicado solo a `api/v1/pixibot/*`.
     - Responde el `OPTIONS` y añade `Access-Control-Allow-Origin: <origin>`, `Access-Control-Allow-Methods: POST, OPTIONS`, `Access-Control-Allow-Headers: Content-Type, Accept, X-System-Key`, `Access-Control-Max-Age: 600` y `Vary: Origin`.
     - Permite cualquier origen, porque no hay cookies (`supports_credentials=false`) y la autorización la da la key.
     - En el `POST`, opcionalmente compara el host de `Origin` con `systems.domain` del sistema resuelto. Si no coincide: registrar un log, o responder 403 si se quiere estricto.
  2. Leer los `domain` de `systems` (con caché) y permitir solo esos orígenes en el middleware anterior.
  - No poner la consulta a la base dentro de `config/cors.php`: se rompe con `config:cache`.
- [ ] T7 — **Pruebas Pest** (`tests/Feature/PixibotAutoIncidentTest.php`):
  - `http_5xx` crea un ticket `Open` con `layer=backend`, severidad P2, `module_route` normalizada, `reporter` del payload y descripción con prefijo `[Automático]`. Responde 202.
  - `oracle_error` con `http_status=200` o `500` deja `layer=base_datos` y `telemetry.ora_code`.
  - `frontend_error` deja `layer=frontend` y severidad P4 (o la que se decida).
  - Sin `reporter_data` crea el ticket con `reporter_name='Pixibot (automático)'`.
  - Misma firma dos veces: 1 ticket con `occurrences_count=2` y **sin** fila hija.
  - Manual después del automático con la misma telemetría (multipart con strings): queda agrupado con el padre automático.
  - Dos ORA distintos en el mismo endpoint generan firmas distintas, y las firmas sin `ora_code` no cambian. Es regresión de los tests existentes de `PixibotIngestionTest`.
  - 403 sin key, con key inválida o con sistema borrado. 422 con `error_type` desconocido, sin `module_route` o con `ora_code` mal formado. 413 con cuerpo de más de 16 KB.
  - 429 al superar el límite.
  - `error_message` con `password=abc` y un JWT queda guardado con `[REDACTED]`.
  - `OPTIONS /api/v1/pixibot/incidents/auto` desde un origen externo responde con los headers CORS.
- [ ] T8 — **Verificación**: `php artisan test` completo en verde y `vendor/bin/pint --dirty`. Prueba de punta a punta con ticket-app: `VITE_PIXIBOT_KEY=<key>` en `.env`, forzar un 500 en un endpoint y comprobar el ticket en el panel, luego otro 500 igual y comprobar que `occurrences_count` sube.

## Decisiones pendientes (equipo backend)

1. **Severidad por tipo** (T3.4): ¿`frontend_error` como P4 (`other`) o P2? La recomendación es P4 al principio, para no inundar el SLA con ruido de JS, y subirla si resulta útil.
2. **Regresiones** (resuelto hace menos de 48 h y vuelve a ocurrir): la lógica actual agrupa con el resuelto y avisa al usuario. Para los automáticos, ¿reabrir el padre (`Open` y nuevo `sla_due_at`) o solo contar la ocurrencia? Recomendación: reabrir. Un error 5xx que reaparece tras resolverse es una regresión real.
3. **CORS estricto o abierto** (T6): ¿validar `Origin` contra `systems.domain` o confiar en la key y en el límite de peticiones?
4. **Retención**: ¿purgar los tickets automáticos `Open` sin asignar y con más de N días, o archivarlos?

## Acceptance Criteria

1. `POST /api/v1/pixibot/incidents/auto` con una key válida y el payload del contrato A responde 202 y crea o agrupa un ticket con la capa correcta (`backend`, `base_datos` o `frontend`).
2. Las repeticiones de la misma firma incrementan `occurrences_count` del padre sin crear filas nuevas.
3. Un reporte manual con la misma telemetría queda agrupado con el incidente automático.
4. Las firmas existentes no cambian y los tests de `PixibotIngestionTest` siguen en verde.
5. 403, 413, 422 y 429 se comportan como se describe, y el widget instalado en un dominio externo puede enviar reportes (CORS).
6. No se guarda en `tickets` ningún secreto con forma de token, contraseña, JWT o credencial Oracle.

## Log

- **L1 (2026-11-21)**: "Ahora necesito que hagas la revision de lo implementado y luego de terminar realices el plan en .md para darle las instrucciones de lo que necesita el backend para recibir estos datos."
- **L2 (2026-11-21)**: Plan redactado a partir del contrato real del widget (`packages/pixibot-widget/src/telemetry/dispatch.ts`, `submit.ts`) y del estado de `ticket-api` (`routes/api.php`, `StorePixibotTicketRequest`, `TicketService::ingestFromPixibot`, `TicketTriageService`, `config/cors.php`, migración unificada de `tickets`). No se modificó `ticket-api`.
