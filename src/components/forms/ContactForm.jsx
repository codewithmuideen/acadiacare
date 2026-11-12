import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'motion/react'
import { toast } from 'sonner'
import { CheckCircle2, Loader2, RotateCcw, Send, TriangleAlert } from 'lucide-react'
import { contactSchema, contactSubjects } from '../../lib/schemas'
import { postJSON } from '../../lib/api'
import { primaryEmail, primaryPhone } from '../../data/site'
import { TextField, TextArea, SelectField } from './Field'
import Button from '../common/Button'
import { ease } from '../../lib/motion'

/** Map ?subject= query shortcuts (used by service CTAs) to subject options. */
const subjectAliases = {
  staffing: 'Staffing requirements',
  residential: 'Residential care support',
  domiciliary: 'Domiciliary care',
  recruitment: 'Recruitment / working with us',
}
export const resolveSubject = (q) => subjectAliases[q] || (contactSubjects.includes(q) ? q : '')

/**
 * Contact form. Posts to /api/contact (or /api/enquiry for recruitment
 * enquiries). Shows success ONLY when the server confirms delivery.
 */
export default function ContactForm({ defaultSubject = '', compact = false }) {
  const [status, setStatus] = useState('idle') // idle | success | error
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(contactSchema),
    mode: 'onTouched',
    defaultValues: { name: '', email: '', phone: '', subject: defaultSubject, message: '', website: '' },
  })

  const onSubmit = async (values) => {
    setServerError('')
    const isRecruitment = values.subject === 'Recruitment / working with us'
    try {
      await postJSON(isRecruitment ? '/api/enquiry' : '/api/contact', {
        ...values,
        type: isRecruitment ? 'recruitment' : 'contact',
        page: window.location.pathname,
      })
      setStatus('success')
      toast.success('Message sent', { description: 'Thank you. Our team will be in touch during office hours.' })
      reset()
    } catch (err) {
      setStatus('error')
      setServerError(err.message)
    }
  }

  return (
    <div className="relative">
      <AnimatePresence mode="wait" initial={false}>
        {status === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease }}
            className="flex min-h-[26rem] flex-col items-start justify-center"
            role="status"
            aria-live="polite"
          >
            <span className="grid h-16 w-16 place-items-center rounded-full bg-brand-tint text-brand-strong">
              <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
            </span>
            <h3 className="mt-8 text-display-sm">Thank you, your message is on its way.</h3>
            <p className="mt-4 max-w-md text-muted">
              Our friendly team respond to all messages during office hours (9.00am to 5.30pm, Monday to Friday).
            </p>
            <button
              type="button"
              onClick={() => setStatus('idle')}
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-brand-strong hover:text-brand-deep"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" /> Send another message
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            aria-label="Contact form"
            className="grid gap-5 sm:grid-cols-2"
          >
            <TextField label="Name" required autoComplete="name" error={errors.name?.message} {...register('name')} />
            <TextField
              label="Email address"
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              error={errors.email?.message}
              {...register('email')}
            />
            <TextField
              label="Phone number"
              type="tel"
              required
              autoComplete="tel"
              inputMode="tel"
              error={errors.phone?.message}
              {...register('phone')}
            />
            <SelectField
              label="Subject"
              required
              placeholder="Choose a subject"
              options={contactSubjects}
              error={errors.subject?.message}
              {...register('subject')}
            />
            <TextArea
              label="Message"
              required
              rows={compact ? 4 : 6}
              className="sm:col-span-2"
              error={errors.message?.message}
              hint="Please don’t include medical or other sensitive personal details in this form."
              {...register('message')}
            />

            {/* Honeypot: hidden from people and assistive tech */}
            <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
              <label>
                Leave this field empty
                <input type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
              </label>
            </div>

            <AnimatePresence>
              {status === 'error' && serverError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  role="alert"
                  className="overflow-hidden sm:col-span-2"
                >
                  <div className="flex gap-3 rounded-2xl border border-rose/40 bg-rose/5 p-4 text-sm text-ink">
                    <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-rose" aria-hidden="true" />
                    <div>
                      <p className="font-semibold">Your message hasn’t been sent.</p>
                      <p className="mt-1 text-ink-soft">
                        {serverError} You can reach us on{' '}
                        <a className="font-semibold underline" href={primaryPhone.href}>
                          {primaryPhone.label}
                        </a>{' '}
                        or{' '}
                        <a className="font-semibold underline" href={`mailto:${primaryEmail}`}>
                          {primaryEmail}
                        </a>
                        .
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted">
                By sending this form you agree to us using your details to respond to your enquiry. See our{' '}
                <Link to="/privacy-policy" className="underline hover:text-ink">
                  privacy policy
                </Link>
                .
              </p>
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                icon={isSubmitting ? null : Send}
                className="shrink-0"
                aria-live="polite"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Sending…
                  </span>
                ) : (
                  'Send message'
                )}
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
