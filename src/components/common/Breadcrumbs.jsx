import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { cn } from '../../lib/cn'

export default function Breadcrumbs({ items, light = false, className }) {
  const all = [{ name: 'Home', path: '/' }, ...items]
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className={cn('flex flex-wrap items-center gap-1.5 text-sm', light ? 'text-cream/70' : 'text-muted')}>
        {all.map((item, i) => {
          const last = i === all.length - 1
          return (
            <li key={item.path} className="flex items-center gap-1.5">
              {last ? (
                <span aria-current="page" className={light ? 'text-cream' : 'text-ink'}>
                  {item.name}
                </span>
              ) : (
                <>
                  <Link to={item.path} className="link-underline hover:text-brand-strong">
                    {item.name}
                  </Link>
                  <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 opacity-60" />
                </>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
