/**
 * Branding de Pixibot: robot pixel-art estilo cartoon 2D, como string SVG.
 * Cada parte (antena, cabeza, brazos, piernas, ojos) es un grupo con nombre
 * para animarla de forma independiente desde CSS (caminar, saltar, parpadear).
 */
export function robotSvg(size: number): string {
  const ink = '#1E293B'
  const acc = 'var(--pxb-accent-400)'
  const r = (x: number, y: number, w: number, h: number, f: string) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}"/>`
  return `<svg class="robot" width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" shape-rendering="crispEdges" aria-hidden="true" focusable="false">
  <g class="leg legL">${r(5, 14, 2, 1, '#94A3B8')}${r(4, 15, 3, 1, ink)}${r(5, 14, 2, 1, ink)}${r(5, 14, 1, 1, '#CBD5E1')}</g>
  <g class="leg legR">${r(9, 14, 2, 1, ink)}${r(9, 15, 3, 1, ink)}${r(9, 14, 1, 1, '#CBD5E1')}</g>
  <g class="all">
    <g class="arm armL">${r(2, 10, 2, 3, ink)}${r(2, 10, 1, 2, '#CBD5E1')}${r(2, 12, 2, 1, acc)}</g>
    <g class="arm armR">${r(12, 10, 2, 3, ink)}${r(13, 10, 1, 2, '#94A3B8')}${r(12, 12, 2, 1, acc)}</g>
    <g class="torso">
      ${r(4, 10, 8, 4, ink)}${r(5, 10, 6, 3, '#E2E8F0')}${r(5, 12, 6, 1, '#94A3B8')}${r(5, 10, 2, 1, '#F8FAFC')}
      <g class="leds">${r(7, 11, 2, 1, acc)}</g>
    </g>
    <g class="head">
      <g class="antenna">${r(7, 2, 2, 1, ink)}${r(6, 0, 4, 2, ink)}${r(7, 0, 2, 2, acc)}${r(7, 0, 1, 1, '#fff')}</g>
      ${r(3, 3, 10, 7, ink)}${r(2, 4, 12, 5, ink)}
      ${r(3, 4, 10, 5, '#E2E8F0')}${r(4, 3, 8, 1, '#E2E8F0')}${r(4, 3, 3, 1, '#F8FAFC')}${r(3, 8, 10, 1, '#CBD5E1')}
      ${r(4, 9, 8, 1, ink)}
      ${r(4, 4, 8, 4, '#0F172A')}
      <g class="eyes">${r(5, 5, 2, 2, acc)}${r(5, 5, 1, 1, '#fff')}${r(9, 5, 2, 2, acc)}${r(9, 5, 1, 1, '#fff')}</g>
      ${r(4, 7, 1, 1, '#FB7185')}${r(11, 7, 1, 1, '#FB7185')}
      ${r(7, 7, 2, 1, '#64748B')}
    </g>
  </g>
</svg>`
}
