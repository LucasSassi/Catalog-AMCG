export type ReviewItemStatus = 'PENDENTE' | 'APROVADO' | 'REJEITADO'
export type ReviewStatusFilter = ReviewItemStatus | 'TODOS'

export type ReviewStatusCounts = Record<ReviewStatusFilter, number>

export function countByStatus(
  items: ReadonlyArray<{ status: ReviewItemStatus }>,
): ReviewStatusCounts {
  const counts: ReviewStatusCounts = {
    PENDENTE: 0,
    APROVADO: 0,
    REJEITADO: 0,
    TODOS: items.length,
  }

  for (const item of items) {
    counts[item.status] += 1
  }

  return counts
}

export function matchesStatus(
  status: ReviewItemStatus,
  filter: ReviewStatusFilter,
): boolean {
  return filter === 'TODOS' || status === filter
}

export function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  const first = words[0]?.[0] ?? ''
  const second = words.length > 1 ? (words[words.length - 1][0] ?? '') : ''

  return `${first}${second}`.toUpperCase()
}

const DAY_MS = 24 * 60 * 60 * 1000

export function getWaitingDays(createdAt: string, now = Date.now()): number {
  const created = new Date(createdAt).getTime()

  if (Number.isNaN(created)) {
    return 0
  }

  return Math.max(0, Math.floor((now - created) / DAY_MS))
}

export function formatWaitingDays(days: number): string {
  if (days === 0) {
    return 'hoje'
  }

  if (days === 1) {
    return 'há 1 dia'
  }

  return `há ${days} dias`
}

/** Pendências antigas merecem atenção: mais de uma semana na fila. */
export const WAITING_DAYS_WARNING = 7

export interface ReviewChecklistItem {
  id: string
  label: string
  ok: boolean
  detail?: string
}

export interface ReviewAlert {
  id: string
  label: string
  tone: 'warning' | 'danger'
}
