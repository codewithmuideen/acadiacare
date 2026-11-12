import { motion } from 'motion/react'
import { Check } from 'lucide-react'
import { cn } from '../../lib/cn'

/**
 * Progress indicator. Desktop: vertical step list (completed steps are
 * clickable). Mobile: compact bar with "Step x of y".
 */
export default function FormProgress({ steps, current, maxReached, onSelect }) {
  const pct = ((current + 1) / steps.length) * 100
  return (
    <>
      {/* Mobile */}
      <div className="lg:hidden">
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-semibold text-ink">{steps[current].title}</span>
          <span className="tabular-nums text-muted">
            Step {current + 1} of {steps.length}
          </span>
        </div>
        <div
          className="mt-3 h-1.5 overflow-hidden rounded-full bg-line"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={steps.length}
          aria-valuenow={current + 1}
          aria-label="Application progress"
        >
          <motion.div className="h-full rounded-full bg-brand-strong" animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} />
        </div>
      </div>

      {/* Desktop */}
      <nav aria-label="Application steps" className="hidden lg:block">
        <ol className="relative space-y-1">
          {steps.map((s, i) => {
            const done = i < current
            const active = i === current
            const reachable = i <= maxReached
            return (
              <li key={s.id}>
                <button
                  type="button"
                  disabled={!reachable || active}
                  onClick={() => onSelect(i)}
                  aria-current={active ? 'step' : undefined}
                  className={cn(
                    'group flex w-full items-center gap-4 rounded-xl px-3 py-2.5 text-left transition-colors',
                    reachable && !active && 'hover:bg-sand',
                    !reachable && 'cursor-not-allowed',
                  )}
                >
                  <span
                    className={cn(
                      'grid h-9 w-9 shrink-0 place-items-center rounded-full border text-xs font-semibold tabular-nums transition-all duration-500',
                      active && 'border-brand-strong bg-brand-strong text-white shadow-[0_0_0_5px_rgb(var(--brand)/0.15)]',
                      done && 'border-ink bg-ink text-cream',
                      !active && !done && 'border-line text-muted',
                    )}
                  >
                    {done ? <Check className="h-4 w-4" aria-hidden="true" /> : String(i + 1).padStart(2, '0')}
                  </span>
                  <span>
                    <span className={cn('block text-[0.95rem] font-semibold', active ? 'text-ink' : done ? 'text-ink-soft' : 'text-muted')}>
                      {s.title}
                    </span>
                    {done && <span className="sr-only"> (completed)</span>}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}
