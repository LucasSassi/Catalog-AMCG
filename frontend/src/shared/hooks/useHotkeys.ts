import { useEffect, useRef } from 'react'
import { isAnyDialogOpen } from './useDialogBehavior'

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  const tag = target.tagName

  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    target.isContentEditable
  )
}

/**
 * Atalhos de teclado da página. Ignora teclas enquanto a pessoa digita em um
 * campo ou enquanto existe um diálogo aberto por cima da página.
 */
export function useHotkeys(
  handler: (event: KeyboardEvent) => void,
  enabled = true,
) {
  const handlerRef = useRef(handler)

  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    if (!enabled) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.altKey) {
        return
      }

      if (isTypingTarget(event.target) || isAnyDialogOpen()) {
        return
      }

      handlerRef.current(event)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [enabled])
}
