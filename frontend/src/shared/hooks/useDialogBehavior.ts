import { useEffect, useRef, type RefObject } from 'react'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

const openDialogs: HTMLElement[] = []

export function isAnyDialogOpen(): boolean {
  return openDialogs.length > 0
}

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((element) => element.getClientRects().length > 0)
}

/**
 * Comportamento comum de diálogos modais: foco inicial, foco preso dentro do
 * diálogo, Escape fecha apenas o diálogo do topo, foco volta para quem abriu
 * e a rolagem da página fica travada enquanto houver diálogo aberto.
 */
export function useDialogBehavior(
  containerRef: RefObject<HTMLElement | null>,
  onClose: () => void,
  initialFocusRef?: RefObject<HTMLElement | null>,
) {
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    const container = containerRef.current

    if (!container) {
      return
    }

    const dialog: HTMLElement = container
    const previouslyFocused = document.activeElement as HTMLElement | null
    openDialogs.push(dialog)
    document.body.style.overflow = 'hidden'

    const initial =
      initialFocusRef?.current ?? getFocusable(dialog)[0] ?? dialog
    initial.focus({ preventScroll: true })

    function handleKeyDown(event: KeyboardEvent) {
      if (openDialogs[openDialogs.length - 1] !== dialog) {
        return
      }

      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
        return
      }

      if (event.key !== 'Tab') {
        return
      }

      const focusable = getFocusable(dialog)

      if (focusable.length === 0) {
        event.preventDefault()
        dialog.focus()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement
      const isOutside = !dialog.contains(active)

      if (event.shiftKey && (active === first || isOutside)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (active === last || isOutside)) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      const index = openDialogs.lastIndexOf(dialog)

      if (index >= 0) {
        openDialogs.splice(index, 1)
      }

      if (openDialogs.length === 0) {
        document.body.style.overflow = ''
      }

      if (previouslyFocused && previouslyFocused.isConnected) {
        previouslyFocused.focus({ preventScroll: true })
      }
    }
  }, [containerRef, initialFocusRef])
}
