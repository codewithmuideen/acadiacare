import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'motion/react'
import { Toaster } from 'sonner'
import Navbar from './Navbar'
import Footer from './Footer'
import MobileCTA from './MobileCTA'
import PageTransition from './PageTransition'
import ScrollToTop from '../common/ScrollToTop'
import BackToTop from '../common/BackToTop'
import { useSmoothScroll } from '../../hooks/useSmoothScroll'

function PageLoader() {
  return (
    <div className="grid min-h-[70vh] place-items-center" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-4">
        <img src="/assets/brand/acadia-monogram.png" alt="" width="303" height="403" className="h-12 w-auto animate-pulse" />
        <span className="sr-only">Loading page…</span>
      </div>
    </div>
  )
}

export default function Layout() {
  useSmoothScroll()
  const location = useLocation()
  return (
    <>
      <a
        href="#main"
        className="sr-only z-[100] rounded-full bg-ink px-5 py-3 text-cream focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <ScrollToTop />
      <Navbar />
      <main id="main" tabIndex={-1} className="outline-none">
        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait" initial={false}>
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </Suspense>
      </main>
      <Footer />
      <MobileCTA />
      <BackToTop />
      <Toaster
        position="top-center"
        toastOptions={{
          classNames: {
            toast: 'font-sans rounded-2xl border border-line bg-cream text-ink shadow-xl',
            description: 'text-muted',
          },
        }}
      />
    </>
  )
}
