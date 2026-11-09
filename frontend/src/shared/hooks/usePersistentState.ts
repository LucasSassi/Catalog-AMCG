import { useState } from 'react'

function readValue<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key)
    return stored === null ? fallback : (JSON.parse(stored) as T)
  } catch {
    return fallback
  }
}

/** Preferência simples do usuário guardada no navegador. */
export function usePersistentState<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => readValue(key, fallback))

  function update(next: T) {
    setValue(next)

    try {
      localStorage.setItem(key, JSON.stringify(next))
    } catch {
      // Sem armazenamento disponível: mantém apenas em memória.
    }
  }

  return [value, update] as const
}
