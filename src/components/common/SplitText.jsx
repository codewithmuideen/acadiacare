import { motion, useReducedMotion } from 'motion/react'
import { ease } from '../../lib/motion'

/**
 * Animates a heading word by word (masked slide-up). Accessible: the full
 * string is exposed via aria-label; the animated spans are aria-hidden.
 * `parts` may be a string, or an array of strings / { text, className, break }.
 */
export default function SplitText({ as: Tag = 'h2', parts, className, delay = 0, inView = true, stagger = 0.06, id }) {
  const reduce = useReducedMotion()
  const segments = (Array.isArray(parts) ? parts : [parts]).map((p) => (typeof p === 'string' ? { text: p } : p))
  const label = segments
    .map((s) => s.text)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
  let i = 0
  const trigger = inView
    ? { whileInView: 'show', viewport: { once: true, margin: '0px 0px -10% 0px' } }
    : { animate: 'show' }

  return (
    <Tag className={className} aria-label={label} id={id}>
      <motion.span aria-hidden="true" initial="hidden" {...trigger} className="block">
        {segments.map((seg, si) => (
          <span key={si} className={seg.className}>
            {seg.text
              .split(' ')
              .filter(Boolean)
              .map((word, wi) => {
                const idx = i++
                return (
                  <span key={wi} className="-mb-[0.14em] inline-block overflow-hidden pb-[0.14em] align-bottom">
                    <motion.span
                      className="inline-block"
                      variants={{
                        hidden: reduce ? { opacity: 0 } : { y: '110%' },
                        show: {
                          opacity: 1,
                          y: '0%',
                          transition: { duration: reduce ? 0.3 : 1, ease, delay: delay + idx * stagger },
                        },
                      }}
                    >
                      {word}
                    </motion.span>
                    {' '}
                  </span>
                )
              })}
            {seg.break && <br />}
          </span>
        ))}
      </motion.span>
    </Tag>
  )
}
