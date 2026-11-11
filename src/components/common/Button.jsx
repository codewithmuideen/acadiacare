import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '../../lib/cn'

const variants = {
  primary: 'bg-brand-strong text-white hover:bg-brand-deep shadow-[0_12px_30px_-14px_rgb(var(--brand-strong)/0.7)]',
  dark: 'bg-ink text-cream hover:bg-ink-soft',
  light: 'bg-cream text-ink hover:bg-white',
  outline: 'border border-ink/20 text-ink hover:border-ink hover:bg-ink hover:text-cream',
  'outline-light': 'border border-cream/30 text-cream hover:border-cream hover:bg-cream hover:text-ink',
}

const sizes = {
  sm: 'h-10 px-4 text-sm',
  md: 'h-12 px-6 text-[0.95rem]',
  lg: 'h-14 px-7 text-base',
}

/**
 * Button / link. Renders a router <Link> for internal paths, <a> for
 * external/tel/mailto, otherwise a <button>.
 */
export default function Button({
  to,
  href,
  variant = 'primary',
  size = 'md',
  icon = ArrowUpRight,
  iconLeft,
  className,
  children,
  type = 'button',
  ...rest
}) {
  const Icon = icon
  const IconLeft = iconLeft
  const classes = cn(
    'group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full font-semibold tracking-tight transition-colors duration-500 ease-soft focus-visible:outline-offset-4 disabled:pointer-events-none disabled:opacity-60',
    variants[variant],
    sizes[size],
    className,
  )
  const content = (
    <>
      {IconLeft && <IconLeft aria-hidden="true" className="h-4 w-4 shrink-0" />}
      <span className="relative">{children}</span>
      {Icon && (
        <span className="relative -mr-1 grid h-5 w-5 shrink-0 place-items-center overflow-hidden" aria-hidden="true">
          <Icon className="h-4 w-4 transition-transform duration-500 ease-soft group-hover:-translate-y-5 group-hover:translate-x-5" />
          <Icon className="absolute h-4 w-4 -translate-x-5 translate-y-5 transition-transform duration-500 ease-soft group-hover:translate-x-0 group-hover:translate-y-0" />
        </span>
      )}
    </>
  )
  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    )
  }
  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {content}
      </a>
    )
  }
  return (
    <button type={type} className={classes} {...rest}>
      {content}
    </button>
  )
}

/** Quiet text link with animated arrow, for "Read more" style actions. */
export function TextLink({ to, href, children, className, light = false, ...rest }) {
  const classes = cn('group inline-flex items-center gap-3 font-semibold', light ? 'text-cream' : 'text-ink', className)
  const inner = (
    <>
      <span className="link-underline pb-0.5">{children}</span>
      <span
        aria-hidden="true"
        className={cn(
          'grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-all duration-500 ease-soft group-hover:rotate-45',
          light
            ? 'border-cream/30 group-hover:border-brand-soft group-hover:bg-brand-soft group-hover:text-ink'
            : 'border-ink/15 group-hover:border-brand-strong group-hover:bg-brand-strong group-hover:text-white',
        )}
      >
        <ArrowUpRight className="h-4 w-4" />
      </span>
    </>
  )
  return to ? (
    <Link to={to} className={classes} {...rest}>
      {inner}
    </Link>
  ) : (
    <a href={href} className={classes} {...rest}>
      {inner}
    </a>
  )
}
