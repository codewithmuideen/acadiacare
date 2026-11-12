import { useEffect, useRef, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Mail, Phone, ShieldAlert, TriangleAlert } from 'lucide-react'
import { applicationSchema, defaultValues, stepFields } from '../../lib/applicationSchema'
import { submitApplication } from '../../lib/submitApplication'
import { primaryEmail, primaryPhone } from '../../data/site'
import { getLenis } from '../../hooks/useSmoothScroll'
import { ease } from '../../lib/motion'
import FormProgress from './FormProgress'
import Button from '../common/Button'
import PersonalInformation from './steps/PersonalInformation'
import BackgroundChecks from './steps/BackgroundChecks'
import WorkHistory from './steps/WorkHistory'
import References from './steps/References'
import MedicalQuestionnaire from './steps/MedicalQuestionnaire'
import WorkPreferences from './steps/WorkPreferences'
import Declaration from './steps/Declaration'
import Review from './steps/Review'

const steps = [
  { id: 'personal', title: 'Personal information', intro: 'Let’s start with your details and an emergency contact.', Component: PersonalInformation },
  { id: 'background', title: 'Background checks', intro: 'Questions about your DBS check and any convictions.', Component: BackgroundChecks },
  { id: 'work', title: 'Work history', intro: 'Your previous employment.', Component: WorkHistory },
  { id: 'references', title: 'References', intro: 'Two or more people or companies we may contact.', Component: References },
  { id: 'medical', title: 'Medical questionnaire', intro: 'For your safety and the safety of the people you work with.', Component: MedicalQuestionnaire },
  { id: 'preferences', title: 'Work preferences', intro: 'When and how you would like to work.', Component: WorkPreferences },
  { id: 'declaration', title: 'Declaration & consent', intro: 'Please read carefully and confirm.', Component: Declaration },
  { id: 'review', title: 'Review & submit', intro: 'One last look before you send your application.', Component: Review },
]

/**
 * Multi-step staff application.
 * Privacy: answers live only in React state for this tab. Nothing is written to
 * localStorage/sessionStorage/cookies or sent to analytics. Progress is NOT
 * saved between visits. Saving drafts requires the secure backend
 * (see docs/SECURE-APPLICATION-SUBMISSION.md).
 */
export default function ApplicationWizard() {
  const [current, setCurrent] = useState(0)
  const [maxReached, setMaxReached] = useState(0)
  const [direction, setDirection] = useState(1)
  const [result, setResult] = useState(null) // { type: 'success' | 'error' | 'not-configured', message }
  const headingRef = useRef(null)
  const topRef = useRef(null)
  const reduce = useReducedMotion()
  const firstRender = useRef(true)

  const methods = useForm({
    resolver: zodResolver(applicationSchema),
    defaultValues,
    mode: 'onTouched',
    shouldFocusError: true,
  })
  const {
    handleSubmit,
    trigger,
    formState: { isSubmitting, isDirty },
  } = methods

  // Warn before leaving with unsent answers (data is not saved anywhere).
  useEffect(() => {
    const onBeforeUnload = (e) => {
      if (isDirty && result?.type !== 'success') {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [isDirty, result])

  // Move focus + scroll to the step heading on step change.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    const top = topRef.current
    if (top) {
      const lenis = getLenis()
      if (lenis) lenis.scrollTo(top, { offset: -110 })
      else top.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    }
    setTimeout(() => headingRef.current?.focus({ preventScroll: true }), 350)
  }, [current, reduce])

  const goTo = (i) => {
    setDirection(i > current ? 1 : -1)
    setCurrent(i)
    setMaxReached((m) => Math.max(m, i))
  }

  const next = async () => {
    const fields = stepFields[steps[current].id]
    const valid = fields.length ? await trigger(fields, { shouldFocus: true }) : true
    if (valid) goTo(current + 1)
  }

  const onSubmit = async (values) => {
    setResult(null)
    try {
      await submitApplication(values)
      setResult({ type: 'success' })
    } catch (err) {
      setResult({ type: err.code === 'not-configured' ? 'not-configured' : 'error', message: err.message })
    }
  }

  // If final validation fails, jump to the first step with an error.
  const onInvalid = (errs) => {
    const keys = Object.keys(errs)
    const idx = steps.findIndex((s) => stepFields[s.id].some((f) => keys.includes(f)))
    if (idx >= 0) goTo(idx)
  }

  if (result?.type === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
        className="mx-auto max-w-2xl rounded-[2rem] bg-surface p-8 text-center shadow-xl sm:p-14"
        role="status"
      >
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-brand-tint text-brand-strong">
          <CheckCircle2 className="h-10 w-10" aria-hidden="true" />
        </span>
        <h2 className="mt-8 text-display-sm">Thank you for applying to Acadia Care.</h2>
        <p className="mt-4 text-muted">
          Your application has been received securely. Our team will review it and contact you during office hours.
        </p>
      </motion.div>
    )
  }

  const step = steps[current]
  const StepComponent = step.Component
  const isLast = current === steps.length - 1

  return (
    <FormProvider {...methods}>
      <div ref={topRef} className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <aside className="lg:col-span-4 xl:col-span-3">
          <div className="lg:sticky lg:top-32">
            <FormProgress steps={steps} current={current} maxReached={maxReached} onSelect={goTo} />
          </div>
        </aside>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (isLast) handleSubmit(onSubmit, onInvalid)(e)
            else next()
          }}
          noValidate
          aria-labelledby="step-heading"
          className="min-w-0 lg:col-span-8 xl:col-span-9"
        >
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={step.id}
              custom={direction}
              initial={reduce ? { opacity: 0 } : { opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.45, ease }}
            >
              <header className="mb-10 border-b border-line pb-8">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-strong">
                  Step {current + 1} of {steps.length}
                </p>
                <h2 id="step-heading" ref={headingRef} tabIndex={-1} className="mt-3 text-display-sm outline-none">
                  {step.title}
                </h2>
                <p className="mt-2 text-muted">{step.intro}</p>
              </header>
              <StepComponent onEdit={goTo} />
            </motion.div>
          </AnimatePresence>

          {/* Submission feedback */}
          <AnimatePresence>
            {result && result.type !== 'success' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                role="alert"
                className="mt-10 rounded-[1.5rem] border border-rose/40 bg-rose/5 p-6"
              >
                <div className="flex gap-4">
                  {result.type === 'not-configured' ? (
                    <ShieldAlert className="mt-0.5 h-6 w-6 shrink-0 text-rose" aria-hidden="true" />
                  ) : (
                    <TriangleAlert className="mt-0.5 h-6 w-6 shrink-0 text-rose" aria-hidden="true" />
                  )}
                  <div>
                    <p className="font-semibold text-ink">
                      {result.type === 'not-configured'
                        ? 'Your application has not been sent. Online applications are not open yet.'
                        : 'Your application has not been sent.'}
                    </p>
                    <p className="mt-2 text-ink-soft">
                      {result.type === 'not-configured'
                        ? 'We are setting up a secure system for receiving applications that include health and background information. In the meantime, please contact our team and we will help you apply.'
                        : `${result.message} Please try again, or contact our team.`}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <a href={primaryPhone.href} className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-cream">
                        <Phone className="h-4 w-4" aria-hidden="true" /> {primaryPhone.label}
                      </a>
                      <a
                        href={`mailto:${primaryEmail}?subject=${encodeURIComponent('Job application enquiry')}`}
                        className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-4 py-2.5 text-sm font-semibold text-ink"
                      >
                        <Mail className="h-4 w-4" aria-hidden="true" /> Email us
                      </a>
                    </div>
                    <p className="mt-3 text-xs text-muted">Please don’t email medical or conviction details. Our team will explain how to share them safely.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-12 flex flex-col-reverse gap-3 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
            {current > 0 ? (
              <Button variant="outline" size="lg" iconLeft={ArrowLeft} icon={null} onClick={() => goTo(current - 1)}>
                Back
              </Button>
            ) : (
              <span />
            )}
            <Button type="submit" size="lg" icon={isSubmitting ? null : ArrowRight} disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Submitting…
                </span>
              ) : isLast ? (
                'Submit application'
              ) : (
                <>
                  <span className="md:hidden">Continue</span>
                  <span className="hidden md:inline">Continue to {steps[current + 1].title.toLowerCase()}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </FormProvider>
  )
}
