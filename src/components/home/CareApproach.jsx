import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Container from '../common/Container'
import SectionHeading from '../common/SectionHeading'
import { approach } from '../../data/site'

gsap.registerPlugin(ScrollTrigger)

/**
 * Four-step approach. GSAP draws the connecting line as the section scrolls
 * through the viewport (scrubbed, no pinning, so the page never stops scrolling).
 */
export default function CareApproach() {
  const root = useRef(null)

  useLayoutEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = gsap.context(() => {
      if (reduce) return
      gsap.fromTo(
        '[data-line]',
        { scaleX: 0, scaleY: 0 },
        {
          scaleX: 1,
          scaleY: 1,
          ease: 'none',
          scrollTrigger: { trigger: '[data-steps]', start: 'top 75%', end: 'bottom 55%', scrub: 0.6 },
        },
      )
      gsap.utils.toArray('[data-step]').forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 40,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%' },
        })
        const dot = el.querySelector('[data-dot]')
        gsap.fromTo(
          dot,
          { backgroundColor: 'rgb(248 245 240)', color: 'rgb(31 26 23)' },
          {
            backgroundColor: 'rgb(176 31 128)',
            color: 'rgb(255 255 255)',
            borderColor: 'rgb(176 31 128)',
            scrollTrigger: { trigger: el, start: 'top 65%', end: 'top 50%', scrub: true },
          },
        )
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} aria-labelledby="approach-title" className="relative py-24 md:py-36">
      <Container>
        <SectionHeading
          id="approach-title"
          align="center"
          eyebrow="Our approach"
          title={['A considered path to', { text: 'the right care.', className: 'italic text-brand-strong' }]}
          intro="Every placement begins with the person: their background, their needs and their choices."
        />

        <ol data-steps className="relative mt-20 grid gap-12 md:mt-28 lg:grid-cols-4 lg:gap-8">
          {/* Connecting line: vertical on mobile, horizontal on desktop */}
          <span aria-hidden="true" className="absolute bottom-6 left-6 top-6 w-px bg-line lg:hidden" />
          <span aria-hidden="true" data-line className="absolute bottom-6 left-6 top-6 w-px origin-top bg-brand-strong lg:hidden" />
          <span aria-hidden="true" className="absolute left-6 right-6 top-6 hidden h-px bg-line lg:block" />
          <span aria-hidden="true" data-line className="absolute left-6 right-6 top-6 hidden h-px origin-left bg-brand-strong lg:block" />

          {approach.map((step, i) => (
            <li key={step.title} data-step className="relative pl-20 lg:pl-0">
              <span
                data-dot
                className="absolute left-0 top-0 grid h-12 w-12 place-items-center rounded-full border border-line bg-cream font-sans text-sm font-semibold tabular-nums lg:relative"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="font-display text-[1.75rem] leading-tight lg:mt-10">{step.title}</h3>
              <p className="mt-4 text-[0.97rem] leading-relaxed text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}
