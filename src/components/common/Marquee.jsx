import { cn } from '../../lib/cn'

/** Slow, decorative values ticker. Pauses on hover; static for reduced motion. */
export default function Marquee({ items, className }) {
  const row = (hidden) => (
    <ul className="flex shrink-0 items-center gap-10 pr-10" aria-hidden={hidden || undefined}>
      {items.map((item) => (
        <li key={item} className="flex items-center gap-10 whitespace-nowrap">
          <span className="font-display text-4xl italic text-ink md:text-6xl">{item}</span>
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-brand md:h-7 md:w-7" aria-hidden="true">
            <path fill="currentColor" d="M12 0c.8 6.4 5.6 11.2 12 12-6.4.8-11.2 5.6-12 12-.8-6.4-5.6-11.2-12-12C6.4 11.2 11.2 6.4 12 0Z" />
          </svg>
        </li>
      ))}
    </ul>
  )
  return (
    <div className={cn('group relative flex overflow-hidden py-8 md:py-10', className)}>
      <div className="flex animate-marquee group-hover:[animation-play-state:paused] motion-reduce:animate-none">
        {row(false)}
        {row(true)}
      </div>
    </div>
  )
}
