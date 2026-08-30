import { useState } from 'react'
import { Button } from './Button'

interface ReviewActionsProps {
  disabled?: boolean
  onApprove: () => Promise<void>
  onReject: (reason: string) => Promise<void>
}

export function ReviewActions({
  disabled = false,
  onApprove,
  onReject,
}: ReviewActionsProps) {
  const [showReason, setShowReason] = useState(false)
  const [reason, setReason] = useState('')

  async function handleReject() {
    if (!showReason) {
      setShowReason(true)
      return
    }

    if (!reason.trim()) {
      return
    }

    await onReject(reason.trim())
    setReason('')
    setShowReason(false)
  }

  let rejectLabel = 'Rejeitar'

  if (showReason) {
    rejectLabel = 'Confirmar rejeição'
  }

  return (
    <div className="mt-5 border-t border-slate-200 pt-4">
      {showReason ? (
        <label className="mb-3 block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">
            Motivo da rejeição
          </span>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-600"
            placeholder="Explique o que precisa ser corrigido"
          />
        </label>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button disabled={disabled} onClick={onApprove}>
          Aprovar
        </Button>
        <Button
          disabled={disabled || (showReason && !reason.trim())}
          variant="danger"
          onClick={handleReject}
        >
          {rejectLabel}
        </Button>
        {showReason ? (
          <Button
            disabled={disabled}
            variant="ghost"
            onClick={() => setShowReason(false)}
          >
            Cancelar
          </Button>
        ) : null}
      </div>
    </div>
  )
}
