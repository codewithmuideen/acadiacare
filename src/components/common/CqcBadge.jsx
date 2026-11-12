import { ShieldCheck } from 'lucide-react'
import { cn } from '../../lib/cn'

/**
 * Trust mark stating Acadia is registered with the Care Quality Commission.
 * A text badge in Acadia's own styling (not the CQC logo, which needs CQC's
 * own widget/permission to display).
 *
 * variant="card"    – full card for light backgrounds
 * variant="compact" – smaller floating pill
 */
export default function CqcBadge({ variant = 'card', className }) {
  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-3 rounded-2xl bg-white/95 py-2.5 pl-2.5 pr-5 shadow-[0_20px_50px_-20px_rgb(31_26_23/0.45)] ring-1 ring-ink/5 backdrop-blur',
          className,
        )}
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-strong text-white">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="leading-tight">
          <span className="block text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-brand-strong">CQC registered</span>
          <span className="block text-sm font-semibold text-ink">Care Quality Commission</span>
        </span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-2xl border border-brand-strong/15 bg-white/80 p-3 pr-6 shadow-[0_18px_40px_-24px_rgb(31_26_23/0.35)] backdrop-blur',
        className,
      )}
    >
      <span className="relative grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-strong to-brand-deep text-white shadow-inner">
        <ShieldCheck className="h-7 w-7" aria-hidden="true" />
      </span>
      <span className="leading-snug">
        <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-brand-strong">Registered with the</span>
        <span className="block font-display text-xl text-ink sm:text-[1.35rem]">Care Quality Commission</span>
        <span className="block text-xs text-muted">Regulated care provider in England</span>
      </span>
    </div>
  )
}
