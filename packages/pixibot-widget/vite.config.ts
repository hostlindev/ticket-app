import { defineConfig } from 'vite'

// Librería ESM: el sistema que lo instala hace `import '@pixi/pixibot-widget'`.
// html2canvas-pro se importa de forma dinámica (solo si el usuario pide captura).
export default defineConfig({
  build: {
    lib: { entry: 'src/index.ts', formats: ['es'], fileName: () => 'pixibot.js' },
    sourcemap: true,
    emptyOutDir: true,
  },
})
