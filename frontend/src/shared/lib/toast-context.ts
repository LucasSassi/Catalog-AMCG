import { createContext } from 'react'

export interface ToastOptions {
  message: string
  tone?: 'default' | 'error'
  actionLabel?: string
  onAction?: () => void | Promise<unknown>
}

export interface ToastContextValue {
  showToast: (options: ToastOptions) => void
  dismissToast: () => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)
