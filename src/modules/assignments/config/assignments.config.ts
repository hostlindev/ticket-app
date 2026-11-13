import type { AssignmentFilter } from '../interface/assignment.interface'

export const FILTER_OPTIONS: Array<{ label: string; value: AssignmentFilter }> = [
  { label: 'Todos', value: 'all' },
  { label: 'Sin desarrolladores', value: 'unassigned' },
  { label: 'Con equipo', value: 'assigned' },
]

/** Clases literales para que Tailwind las detecte. */
const AVATAR_TONES = [
  'bg-accent-600',
  'bg-emerald-600',
  'bg-amber-600',
  'bg-rose-600',
  'bg-indigo-600',
  'bg-teal-600',
  'bg-fuchsia-600',
  'bg-sky-600',
]

export function avatarTone(id: string): string {
  let hash = 0
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) % 997
  return AVATAR_TONES[hash % AVATAR_TONES.length]!
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}
