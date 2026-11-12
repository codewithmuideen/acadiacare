import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Swiper, SwiperSlide } from 'swiper/react'
import { A11y, FreeMode, Keyboard } from 'swiper/modules'
import 'swiper/css'
import Container from '../common/Container'
import SectionHeading from '../common/SectionHeading'
import Img from '../common/Img'

gsap.registerPlugin(ScrollTrigger)

const columns = [
  [
    { name: 'knitting-group', ratio: 'aspect-[4/5]' },
    { name: 'garden-independence', ratio: 'aspect-[4/3]' },
  ],
  [
    { name: 'social-activity-dancing', ratio: 'aspect-[3/4]', position: '45% 50%' },
    { name: 'walker-support', ratio: 'aspect-square' },
  ],
  [
    { name: 'couple-independent-living', ratio: 'aspect-[3/4]' },
    { name: 'garden-walk-mono', ratio: 'aspect-[4/3]', position: '30% 50%' },
  ],
]

const flat = columns.flat()

/** Staggered gallery with gentle per-column parallax (desktop) and a swipeable strip (mobile). */
export default function ImageGallery() {
  const root = useRef(null)

  useLayoutEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const mm = gsap.matchMedia()
    mm.add('(min-width: 1024px)', () => {
      if (reduce) return
      const speeds = [-60, 40, -100]
      gsap.utils.toArray('[data-col]', root.current).forEach((col, i) => {
        gsap.fromTo(
          col,
          { y: -speeds[i] / 2 },
          {
            y: speeds[i],
            ease: 'none',
            scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
          },
        )
      })
    })
    return () => mm.revert()
  }, [])

  return (
    <section ref={root} aria-labelledby="gallery-title" className="relative overflow-hidden bg-sand py-24 md:py-36">
      <Container>
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <SectionHeading
            id="gallery-title"
            eyebrow="Care & support"
            title={['Everyday moments,', { text: 'with dignity.', className: 'italic text-brand-strong' }]}
            className="lg:col-span-7"
          />
          <p className="max-w-md text-muted lg:col-span-5 lg:justify-self-end">
            Compassionate and professional care for the elderly in nursing homes, individuals convalescing in the comfort
            of their own homes, and disabled adults who may require extra support to live independently.
          </p>
        </div>
      </Container>

      {/* Desktop: staggered parallax columns */}
      <Container className="mt-20 hidden lg:block">
        <div className="grid grid-cols-3 gap-6 xl:gap-8">
          {columns.map((col, ci) => (
            <div key={ci} data-col className={ci === 1 ? 'mt-24 space-y-6 xl:space-y-8' : 'space-y-6 xl:space-y-8'}>
              {col.map((img) => (
                <figure key={img.name} className="group overflow-hidden rounded-[1.75rem] bg-stone/40">
                  <Img
                    name={img.name}
                    sizes="30vw"
                    className={img.ratio}
                    position={img.position}
                    imgClassName="transition-transform duration-[1.4s] ease-soft group-hover:scale-105"
                  />
                </figure>
              ))}
            </div>
          ))}
        </div>
      </Container>

      {/* Mobile & tablet: swipeable strip */}
      <div className="mt-14 lg:hidden">
        <Swiper
          modules={[FreeMode, A11y, Keyboard]}
          freeMode
          keyboard={{ enabled: true }}
          a11y={{ enabled: true, containerMessage: 'Gallery of care and support photographs' }}
          slidesPerView={1.25}
          spaceBetween={14}
          slidesOffsetBefore={16}
          slidesOffsetAfter={16}
          breakpoints={{ 640: { slidesPerView: 2.2, spaceBetween: 18, slidesOffsetBefore: 24, slidesOffsetAfter: 24 } }}
        >
          {flat.map((img) => (
            <SwiperSlide key={img.name}>
              <figure className="overflow-hidden rounded-[1.5rem]">
                <Img name={img.name} sizes="(min-width: 640px) 45vw, 80vw" className="aspect-[4/5]" position={img.position} />
              </figure>
            </SwiperSlide>
          ))}
        </Swiper>
        <p className="mt-5 px-4 text-center text-xs uppercase tracking-[0.18em] text-muted" aria-hidden="true">
          Swipe to explore
        </p>
      </div>
    </section>
  )
}
