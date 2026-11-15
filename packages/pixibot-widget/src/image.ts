export const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp']
/** Archivos originales por encima de este peso se rechazan antes de intentar comprimirlos. */
export const MAX_ORIGINAL_BYTES = 10 * 1024 * 1024

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('No se pudo procesar la imagen.'))), 'image/jpeg', quality),
  )
}

/**
 * Reduce una imagen (archivo o canvas) a JPEG con lado máximo de 1400px,
 * bajando calidad/tamaño hasta quedar bajo `maxBytes`.
 */
export async function compressToBlob(source: HTMLCanvasElement | Blob, maxBytes: number): Promise<Blob> {
  let drawable: CanvasImageSource
  let w: number
  let h: number
  if (source instanceof HTMLCanvasElement) {
    drawable = source
    w = source.width
    h = source.height
  } else {
    const bmp = await createImageBitmap(source)
    drawable = bmp
    w = bmp.width
    h = bmp.height
  }

  let scale = Math.min(1, 1400 / Math.max(w, h))
  let quality = 0.82
  let blob: Blob | null = null

  for (let attempt = 0; attempt < 6; attempt++) {
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(w * scale))
    canvas.height = Math.max(1, Math.round(h * scale))
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('No se pudo procesar la imagen.')
    ctx.fillStyle = '#fff' // JPEG no tiene transparencia
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(drawable, 0, 0, canvas.width, canvas.height)
    blob = await canvasToBlob(canvas, quality)
    if (blob.size <= maxBytes) break
    quality = Math.max(0.5, quality - 0.1)
    scale *= 0.8
  }

  if (!blob || blob.size > maxBytes) {
    throw new Error('La imagen es demasiado pesada. Prueba con una más pequeña.')
  }
  return blob
}

/** Valida y comprime una imagen que el usuario eligió desde su equipo. */
export async function prepareUploadedImage(file: File, maxBytes: number): Promise<Blob> {
  if (!ACCEPTED_TYPES.includes(file.type)) throw new Error('Solo se aceptan imágenes PNG, JPG o WebP.')
  if (file.size > MAX_ORIGINAL_BYTES) throw new Error('La imagen supera los 10 MB. Elige una más ligera.')
  return compressToBlob(file, maxBytes)
}

/** Toma una captura del documento actual, ignorando el propio widget. */
export async function captureScreen(ignore: Element, maxBytes: number): Promise<Blob> {
  const { default: html2canvas } = await import('html2canvas-pro')
  const canvas = await html2canvas(document.body, {
    useCORS: true,
    logging: false,
    scale: Math.min(window.devicePixelRatio || 1, 1.5),
    // Solo lo que el usuario está viendo, no toda la página scrolleada.
    x: window.scrollX,
    y: window.scrollY,
    width: window.innerWidth,
    height: window.innerHeight,
    windowWidth: document.documentElement.clientWidth,
    windowHeight: window.innerHeight,
    ignoreElements: (el) => el === ignore,
  })
  return compressToBlob(canvas, maxBytes)
}
