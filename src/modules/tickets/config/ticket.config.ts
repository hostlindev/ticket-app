import type { IssueType } from '../interface/ticket.interface'

export interface IssueTypeMeta {
  label: string
  icon: string
  /** Clases del chip (literales para Tailwind) */
  chip: string
}

export const ISSUE_TYPES: Record<IssueType, IssueTypeMeta> = {
  blocks_flow: {
    label: 'Me bloquea el flujo',
    icon: 'mdi-block-helper',
    chip: 'border-red-200 bg-red-50 text-red-700',
  },
  not_working: {
    label: 'Algo no funciona',
    icon: 'mdi-alert-circle-outline',
    chip: 'border-amber-200 bg-amber-50 text-amber-800',
  },
  wrong_info: {
    label: 'Información incorrecta',
    icon: 'mdi-file-alert-outline',
    chip: 'border-accent-200 bg-accent-50 text-accent-700',
  },
  slow: {
    label: 'Va muy lento',
    icon: 'mdi-speedometer-slow',
    chip: 'border-amber-200 bg-amber-50 text-amber-800',
  },
  visual: {
    label: 'Se ve mal',
    icon: 'mdi-palette-swatch-outline',
    chip: 'border-silver-300 bg-silver-100 text-ink-700',
  },
  other: {
    label: 'Otro',
    icon: 'mdi-dots-horizontal-circle-outline',
    chip: 'border-silver-300 bg-silver-100 text-ink-700',
  },
}

export const ISSUE_TYPE_KEYS = Object.keys(ISSUE_TYPES) as IssueType[]
