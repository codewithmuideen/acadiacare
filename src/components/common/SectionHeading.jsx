import { cn } from '../../lib/cn'
import Reveal from './Reveal'
import SplitText from './SplitText'

export default function SectionHeading({
  eyebrow,
  title,
  intro,
  align = 'left',
  light = false,
  as = 'h2',
  className,
  titleClassName,
  id,
}) {
  return (
    <div className={cn(align === 'center' && 'mx-auto max-w-3xl text-center', className)}>
      {eyebrow && (
        <Reveal y={12}>
          <p className={cn('eyebrow mb-6', light && 'eyebrow-light', align === 'center' && 'justify-center')}>{eyebrow}</p>
        </Reveal>
      )}
      <SplitText
        as={as}
        id={id}
        parts={title}
        className={cn('text-display-md', light ? 'text-cream' : 'text-ink', titleClassName)}
      />
      {intro && (
        <Reveal delay={0.15}>
          <p
            className={cn(
              'mt-6 max-w-2xl text-lg leading-relaxed',
              light ? 'text-cream/75' : 'text-muted',
              align === 'center' && 'mx-auto',
            )}
          >
            {intro}
          </p>
        </Reveal>
      )}
    </div>
  )
}
