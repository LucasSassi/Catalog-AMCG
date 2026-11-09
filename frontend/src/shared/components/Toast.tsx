import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { ToastContext, type ToastOptions } from '../lib/toast-context'

const TOAST_DURATION_MS = 6000

interface ActiveToast extends ToastOptions {
  id: number
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ActiveToast | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const nextId = useRef(0)

  const dismissToast = useCallback(() => setToast(null), [])

  const showToast = useCallback((options: ToastOptions) => {
    nextId.current += 1
    setIsPaused(false)
    setToast({ ...options, id: nextId.current })
  }, [])

  useEffect(() => {
    if (!toast || isPaused) {
      return
    }

    const timer = window.setTimeout(() => setToast(null), TOAST_DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [toast, isPaused])

  const value = useMemo(
    () => ({ showToast, dismissToast }),
    [showToast, dismissToast],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        role="status"
        className="pointer-events-none fixed inset-x-3 bottom-20 z-[70] flex justify-center lg:bottom-6"
      >
        {toast ? (
          <div
            key={toast.id}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocus={() => setIsPaused(true)}
            onBlur={() => setIsPaused(false)}
            className={`pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-xl py-2.5 pl-4 pr-2.5 text-sm text-white shadow-2xl motion-safe:animate-toast-in ${
              toast.tone === 'error' ? 'bg-danger' : 'bg-text'
            }`}
          >
            <span className="min-w-0 flex-1">{toast.message}</span>
            {toast.actionLabel && toast.onAction ? (
              <button
                type="button"
                onClick={() => {
                  const action = toast.onAction
                  setToast(null)
                  void action?.()
                }}
                className="min-h-10 shrink-0 rounded-lg bg-white/10 px-3 font-bold text-accent-yellow-soft transition hover:bg-white/20"
              >
                {toast.actionLabel}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setToast(null)}
              aria-label="Fechar aviso"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-lg text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              ×
            </button>
          </div>
        ) : null}
      </div>
    </ToastContext.Provider>
  )
}
