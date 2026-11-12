import { cn } from '../../lib/cn'

/** Circular rotating text badge with the AC monogram at its centre. */
export default function RotatingBadge({ text = 'A trusted care service • Since 2013 • ', className }) {
  return (
    <div className={cn('relative grid h-32 w-32 place-items-center rounded-full bg-cream shadow-[0_20px_50px_-20px_rgb(31_26_23/0.35)]', className)}>
      <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full animate-spin-slow" aria-hidden="true">
        <defs>
          <path id="badge-circle" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
        </defs>
        <text className="fill-ink-soft font-sans text-[9.4px] font-semibold uppercase tracking-[0.22em]">
          <textPath href="#badge-circle">{text}</textPath>
        </text>
      </svg>
      <img src="/assets/brand/acadia-monogram.png" alt="" width="303" height="403" className="h-11 w-auto" />
    </div>
  )
}
