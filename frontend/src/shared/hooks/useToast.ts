import { useContext } from 'react'
import { ToastContext, type ToastContextValue } from '../lib/toast-context'

const NOOP_TOAST: ToastContextValue = {
  showToast: () => undefined,
  dismissToast: () => undefined,
}

export function useToast(): ToastContextValue {
  return useContext(ToastContext) ?? NOOP_TOAST
}
