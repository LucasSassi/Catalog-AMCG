export interface RejectionReason {
  id: string
  label: string
  message: string
}

export function buildRejectionMessage(
  reasons: ReadonlyArray<RejectionReason>,
  note: string,
): string {
  const parts: string[] = []

  if (reasons.length > 0) {
    parts.push(
      `Sua inscrição precisa de ajustes:\n${reasons
        .map((reason) => `• ${reason.message}`)
        .join('\n')}`,
    )
  }

  if (note.trim()) {
    parts.push(
      reasons.length > 0 ? `Observação: ${note.trim()}` : note.trim(),
    )
  }

  return parts.join('\n\n')
}
