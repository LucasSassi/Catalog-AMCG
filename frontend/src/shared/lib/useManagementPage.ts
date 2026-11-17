import { useEffect, useState } from 'react'
import { apiRequest } from '../api/client'
export interface ManagementPage<T> {
  items: T[]
  hasNext: boolean
  nextLastItemId: string | null
  vinculado?: boolean
  total?: number
}
export function useManagementPage<T>(path: string) {
  const [search, setSearchValue] = useState('')
  const [cursors, setCursors] = useState<Array<string | null>>([null])
  const [data, setData] = useState<ManagementPage<T>>({
    items: [],
    hasNext: false,
    nextLastItemId: null,
  })
  const [loadedKey, setLoadedKey] = useState('')
  const [error, setError] = useState('')
  const [key, setKey] = useState(0)
  const cursor = cursors[cursors.length - 1]
  const requestKey = JSON.stringify([path, search, cursor, key])
  const loading = loadedKey !== requestKey
  useEffect(() => {
    let current = true
    const query = new URLSearchParams({ pageSize: '12', busca: search })
    if (cursor) query.set('lastItemId', cursor)
    apiRequest<ManagementPage<T>>(`${path}?${query}`, { authenticated: true })
      .then((result) => {
        if (!current) return
        setData(result)
        setError('')
        if (!result.items.length && cursor) setCursors((c) => c.slice(0, -1))
      })
      .catch((e) => {
        if (current)
          setError(e instanceof Error ? e.message : 'Falha ao carregar')
      })
      .finally(() => {
        if (current) setLoadedKey(requestKey)
      })
    return () => {
      current = false
    }
  }, [path, search, cursor, key, requestKey])
  return {
    data,
    loading,
    error,
    search,
    setSearch: (value: string) => {
      setSearchValue(value)
      setCursors([null])
    },
    reload: () => setKey((k) => k + 1),
    pagination: {
      hasPrevious: cursors.length > 1 && !loading,
      hasNext: data.hasNext && !loading && !error,
      onPrevious: () => setCursors((c) => c.slice(0, -1)),
      onNext: () => {
        if (data.nextLastItemId) setCursors((c) => [...c, data.nextLastItemId])
      },
    },
  }
}
