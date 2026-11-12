import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import Seo from '../components/common/Seo'
import Container from '../components/common/Container'
import Button from '../components/common/Button'
import Img from '../components/common/Img'
import { nav } from '../data/site'
import { ease } from '../lib/motion'

export default function NotFound() {
  return (
    <>
      <Seo title="Page not found" description="Sorry, we couldn’t find that page on the Acadia Care website." path="/404" noindex />
      <section className="relative overflow-hidden pb-24 pt-[calc(var(--header-h)+3rem)] md:pb-32">
        <Container className="grid items-center gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease }}
              className="text-outline font-display text-[9rem] leading-none sm:text-[13rem]"
              aria-hidden="true"
            >
              404
            </motion.p>
            <h1 className="mt-2 text-display-md">
              This page has <span className="italic text-brand-strong">wandered off.</span>
            </h1>
            <p className="lede mt-6 max-w-lg">
              The page you’re looking for may have moved or no longer exists. Let us help you find your way.
            </p>
            <div className="mt-10 flex flex-col gap-3 xs:flex-row">
              <Button to="/" size="lg">
                Back to home
              </Button>
              <Button to="/contact-acadia-care" variant="outline" size="lg">
                Contact us
              </Button>
            </div>
            <nav aria-label="Popular pages" className="mt-14 border-t border-line pt-8">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted">Popular pages</p>
              <ul className="flex flex-wrap gap-x-8 gap-y-3">
                {nav.slice(1).map((n) => (
                  <li key={n.to}>
                    <Link to={n.to} className="link-underline font-semibold text-ink">
                      {n.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div className="hidden lg:col-span-5 lg:block">
            <div className="aspect-[4/5] overflow-hidden rounded-arch">
              <Img name="garden-walk-mono" sizes="38vw" position="30% 50%" priority />
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
