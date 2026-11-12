import { Link } from 'react-router-dom'
import { useFormContext } from 'react-hook-form'
import { Check } from 'lucide-react'
import { FieldError, TextField } from '../Field'
import { consentText, declarationText } from '../../../data/application'
import { cn } from '../../../lib/cn'

function ConsentBox({ name, title, text, register, error }) {
  const errId = `${name}-error`
  return (
    <div>
      <label
        className={cn(
          'flex cursor-pointer gap-4 rounded-2xl border bg-surface p-5 transition-colors has-[:checked]:border-brand-strong has-[:checked]:bg-brand-tint/50 md:p-6',
          error ? 'border-rose/70' : 'border-line hover:border-ink/30',
        )}
      >
        <input
          type="checkbox"
          className="peer sr-only"
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errId : undefined}
          {...register(name)}
        />
        <span
          aria-hidden="true"
          className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 border-ink/25 text-transparent transition-colors peer-checked:border-brand-strong peer-checked:bg-brand-strong peer-checked:text-white peer-focus-visible:ring-4 peer-focus-visible:ring-brand/25"
        >
          <Check className="h-4 w-4" />
        </span>
        <span>
          <span className="block font-semibold text-ink">
            {title} <span className="text-brand-strong">*</span>
          </span>
          <span className="mt-2 block text-[0.95rem] leading-relaxed text-ink-soft">{text}</span>
        </span>
      </label>
      <FieldError id={errId} message={error} />
    </div>
  )
}

export default function Declaration() {
  const {
    register,
    formState: { errors },
  } = useFormContext()
  return (
    <div className="space-y-5">
      <ConsentBox
        name="consent"
        title="Data protection consent"
        text={consentText}
        register={register}
        error={errors.consent?.message}
      />
      <ConsentBox
        name="declaration"
        title="Applicant declaration"
        text={declarationText}
        register={register}
        error={errors.declaration?.message}
      />
      <div className="pt-4">
        <TextField
          label="Full name (as your signature)"
          required
          autoComplete="name"
          className="max-w-md"
          hint={`Signed electronically on ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`}
          error={errors.signature?.message}
          {...register('signature')}
        />
      </div>
      <p className="pt-2 text-sm text-muted">
        You can withdraw your consent or ask what data we hold about you at any time. See our{' '}
        <Link to="/privacy-policy" target="_blank" rel="noopener" className="underline hover:text-ink">
          privacy policy
        </Link>
        .
      </p>
    </div>
  )
}
