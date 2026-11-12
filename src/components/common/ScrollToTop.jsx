import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getLenis } from '../../hooks/useSmoothScroll'

/** Resets scroll on route change, or scrolls to a #hash target when present. */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    const lenis = getLenis()
    if (hash) {
      // Wait for the lazily-loaded page to render before scrolling to the anchor
      let tries = 0
      const seek = () => {
        const el = document.getElementById(decodeURIComponent(hash.slice(1)))
        if (el) {
          if (lenis) lenis.scrollTo(el, { offset: -100 })
          else el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        } else if (tries++ < 20) {
          setTimeout(seek, 80)
        }
      }
      setTimeout(seek, 60)
      return
    }
    if (lenis) lenis.scrollTo(0, { immediate: true })
    else window.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}
