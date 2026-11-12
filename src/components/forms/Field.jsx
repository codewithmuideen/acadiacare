import { forwardRef, useId } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { AlertCircle, Check } from 'lucide-react'
import { cn } from '../../lib/cn'

/** Animated, screen-reader friendly field error. */
export function FieldError({ id, message }) {
  return (
    <AnimatePresence initial={false}>
      {message && (
        <motion.p
          id={id}
          role="alert"
          initial={{ opacity: 0, y: -4, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -4, height: 0 }}
          transition={{ duration: 0.25 }}
          className="mt-2 flex items-start gap-1.5 text-sm font-medium text-[#B4234A]"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  )
}

function Label({ htmlFor, children, required, optional }) {
  return (
    <label htmlFor={htmlFor} className="field-label">
      {children}
      {required && (
        <span className="ml-0.5 text-brand-strong" aria-hidden="true">
          *
        </span>
      )}
      {optional && <span className="ml-1.5 text-xs font-normal text-muted">(optional)</span>}
    </label>
  )
}

export const TextField = forwardRef(function TextField(
  { label, error, hint, required, optional, className, type = 'text', id: idProp, ...rest },
  ref,
) {
  const autoId = useId()
  const id = idProp ?? autoId
  const errId = `${id}-error`
  const hintId = `${id}-hint`
  return (
    <div className={className}>
      <Label htmlFor={id} required={required} optional={optional}>
        {label}
      </Label>
      <input
        ref={ref}
        id={id}
        type={type}
        aria-invalid={error ? 'true' : 'false'}
        aria-required={required || undefined}
        aria-describedby={cn(error && errId, hint && hintId) || undefined}
        className="field-input"
        {...rest}
      />
      {hint && (
        <p id={hintId} className="field-hint">
          {hint}
        </p>
      )}
      <FieldError id={errId} message={error} />
    </div>
  )
})

export const TextArea = forwardRef(function TextArea(
  { label, error, hint, required, optional, className, rows = 5, id: idProp, ...rest },
  ref,
) {
  const autoId = useId()
  const id = idProp ?? autoId
  const errId = `${id}-error`
  const hintId = `${id}-hint`
  return (
    <div className={className}>
      <Label htmlFor={id} required={required} optional={optional}>
        {label}
      </Label>
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        aria-invalid={error ? 'true' : 'false'}
        aria-required={required || undefined}
        aria-describedby={cn(error && errId, hint && hintId) || undefined}
        className="field-input resize-y"
        {...rest}
      />
      {hint && (
        <p id={hintId} className="field-hint">
          {hint}
        </p>
      )}
      <FieldError id={errId} message={error} />
    </div>
  )
})

export const SelectField = forwardRef(function SelectField(
  { label, error, required, optional, className, options, placeholder, id: idProp, ...rest },
  ref,
) {
  const autoId = useId()
  const id = idProp ?? autoId
  const errId = `${id}-error`
  return (
    <div className={className}>
      <Label htmlFor={id} required={required} optional={optional}>
        {label}
      </Label>
      <div className="relative">
        <select
          ref={ref}
          id={id}
          aria-invalid={error ? 'true' : 'false'}
          aria-required={required || undefined}
          aria-describedby={error ? errId : undefined}
          className="field-input appearance-none pr-10"
          {...rest}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) =>
            /^─+$/.test(o) ? (
              <option key={o} disabled>
                {o}
              </option>
            ) : (
              <option key={o} value={o}>
                {o}
              </option>
            ),
          )}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
        >
          <path fill="currentColor" d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4Z" />
        </svg>
      </div>
      <FieldError id={errId} message={error} />
    </div>
  )
})

/** Yes / No radio question rendered as two large, touch-friendly options. */
export function YesNo({ name, label, register, error, number, required = true, className }) {
  const id = useId()
  const errId = `${id}-error`
  return (
    <fieldset
      className={cn('rounded-2xl border bg-surface p-5 transition-colors md:p-6', error ? 'border-rose/70' : 'border-line', className)}
      aria-describedby={error ? errId : undefined}
      aria-invalid={error ? 'true' : undefined}
    >
      <legend className="sr-only">{label}</legend>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <p className="flex gap-3 text-[0.97rem] font-medium leading-snug text-ink" aria-hidden="true">
          {number != null && <span className="shrink-0 tabular-nums text-muted">{String(number).padStart(2, '0')}</span>}
          <span>
            {label}
            {required && <span className="ml-0.5 text-brand-strong">*</span>}
          </span>
        </p>
        <div className="grid shrink-0 grid-cols-2 gap-2">
          {['Yes', 'No'].map((v) => (
            <label key={v} className="relative cursor-pointer">
              <input type="radio" value={v} className="peer sr-only" {...register(name)} />
              <span className="flex h-11 min-w-[5.5rem] items-center justify-center gap-1.5 rounded-full border border-line px-5 text-sm font-semibold text-ink-soft transition-all duration-300 hover:border-ink/40 peer-checked:border-ink peer-checked:bg-ink peer-checked:text-cream peer-focus-visible:ring-4 peer-focus-visible:ring-brand/25">
                {v}
              </span>
            </label>
          ))}
        </div>
      </div>
      <FieldError id={errId} message={error} />
    </fieldset>
  )
}

/** Multi-choice pill checkboxes (e.g. working days). */
export function CheckboxGroup({ name, legend, options, register, error, hint, type = 'checkbox' }) {
  const id = useId()
  const errId = `${id}-error`
  return (
    <fieldset aria-describedby={error ? errId : undefined}>
      <legend className="field-label">{legend}</legend>
      {hint && <p className="-mt-1 mb-3 text-sm text-muted">{hint}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label key={o} className="relative cursor-pointer">
            <input type={type} value={o} className="peer sr-only" {...register(name)} />
            <span className="flex h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-medium text-ink-soft transition-all duration-300 hover:border-ink/40 peer-checked:border-brand-strong peer-checked:bg-brand-tint peer-checked:text-brand-deep peer-focus-visible:ring-4 peer-focus-visible:ring-brand/25 [&>svg]:hidden peer-checked:[&>svg]:block">
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              {o}
            </span>
          </label>
        ))}
      </div>
      <FieldError id={errId} message={error} />
    </fieldset>
  )
}
