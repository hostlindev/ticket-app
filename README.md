# ticket-app

Panel interno de soporte para equipos de IT: incidencias, sistemas conectados y
base de conocimiento en un solo lugar.

Stack: Vue 3 + TypeScript + Vuetify 4 + Pinia + Vue Router + Tailwind 4 (solo
utilidades) + Axios.

## Marca

La identidad de **Pixi** está centralizada para poder cambiarla sin tocar la UI:

- `src/core/config/brand.ts` → nombre, tagline y correo de soporte.
- `src/core/components/PixelBuddy.vue` → mascota pixel (SVG).
- `src/core/components/PixelHeart.vue` → corazón pixel reutilizable.
- `src/assets/styles/main.css` → paleta crema/coral, sombras duras y detalles pixel.
- `src/plugins/vuetify.ts` → tema `pixiCream` y defaults de componentes.

## Requisitos

- Node `^22.18.0 || >=24.12.0`
- pnpm

##  update

## Setup

```sh
pnpm install
cp .env.example .env
pnpm dev
```

### Acceso demo

El login usa un servicio mock por defecto (`VITE_USE_MOCK=true`):

| Campo    | Valor            |
| -------- | ---------------- |
| Correo   | `admin@ticket.dev` |
| Password | `Ticket123!`     |

Con `VITE_USE_MOCK=false` el módulo de auth llama a `POST /auth/login`,
`POST /auth/logout` y `GET /auth/me` usando `VITE_API_URL`.

## Estructura

```
src/
├── core/                  # Transversal y reutilizable
│   ├── api/               # Axios, interceptores y token en memoria
│   ├── components/        # UI genérica
│   ├── composables/       # Lógica global (toasts)
│   ├── layouts/           # AuthLayout, AppLayout
│   ├── stores/            # Estado global (ui)
│   └── utils/             # Storage, validadores, formateadores
├── modules/               # Módulos de negocio aislados
│   ├── auth/              # components, composables, interface, pages, services, store, routes
│   ├── dashboard/
│   └── tickets/           # (siguiente módulo)
├── plugins/vuetify.ts     # Tema ticketDark + defaults globales
├── router/                # Composición de rutas + guards
└── assets/styles/         # Tailwind utilities-only + tokens y detalles visuales
```

Reglas:

- `modules/*` nunca importa de otro módulo; solo de `core/*` y de sí mismo.
- `core/*` nunca importa de `modules/*` (por eso el token vive en
  `core/api/token.ts` y el store de auth en el módulo).
- Los guards viven en `src/router/` porque son el composition root.

## Scripts

```sh
pnpm dev         # desarrollo
pnpm type-check  # vue-tsc
pnpm build       # type-check + build de producción
pnpm preview     # preview del build
```
