import { Mail, MapPin, Phone } from 'lucide-react'
import { offices } from '../../data/site'
import { cn } from '../../lib/cn'

/** The two offices, presented as typographic address blocks. */
export default function OfficeCards({ light = false, className }) {
  return (
    <div className={cn('grid gap-8 sm:grid-cols-2', className)}>
      {offices.map((o) => (
        <address key={o.id} className={cn('not-italic border-t pt-6', light ? 'border-cream/15' : 'border-ink/10')}>
          <p className={cn('text-xs font-semibold uppercase tracking-[0.2em]', light ? 'text-brand-soft' : 'text-brand-strong')}>
            {o.short}
          </p>
          <p className={cn('mt-3 font-display text-2xl leading-tight', light ? 'text-cream' : 'text-ink')}>{o.name}</p>
          <ul className={cn('mt-5 space-y-3 text-[0.95rem]', light ? 'text-cream/75' : 'text-ink-soft')}>
            {o.address && (
              <li className="flex gap-3">
                <MapPin className="mt-1 h-4 w-4 shrink-0 opacity-60" aria-hidden="true" />
                <span>
                  {o.address.map((l) => (
                    <span key={l} className="block">
                      {l}
                    </span>
                  ))}
                </span>
              </li>
            )}
            {o.phones.map((p) => (
              <li key={p.href} className="flex gap-3">
                <Phone className="mt-1 h-4 w-4 shrink-0 opacity-60" aria-hidden="true" />
                <a href={p.href} className="link-underline font-semibold">
                  {p.label}
                </a>
              </li>
            ))}
            <li className="flex gap-3">
              <Mail className="mt-1 h-4 w-4 shrink-0 opacity-60" aria-hidden="true" />
              <a href={`mailto:${o.email}`} className="link-underline break-all">
                {o.email}
              </a>
            </li>
          </ul>
        </address>
      ))}
    </div>
  )
}
