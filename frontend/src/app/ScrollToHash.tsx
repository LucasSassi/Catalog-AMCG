import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const MAX_SCROLL_ATTEMPTS = 20
const SCROLL_RETRY_DELAY_MS = 100

export function ScrollToHash() {
  const { pathname, hash, key } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0 })
      return
    }

    const elementId = decodeURIComponent(hash.slice(1))
    let attempts = 0
    let timer: number | undefined

    function scrollToElement(): void {
      const element = document.getElementById(elementId)

      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }

      attempts += 1
      if (attempts < MAX_SCROLL_ATTEMPTS) {
        timer = window.setTimeout(scrollToElement, SCROLL_RETRY_DELAY_MS)
      }
    }

    scrollToElement()

    return () => window.clearTimeout(timer)
  }, [pathname, hash, key])

  return null
}
