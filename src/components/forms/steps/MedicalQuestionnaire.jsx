import { useFormContext } from 'react-hook-form'
import { AnimatePresence, motion } from 'motion/react'
import { Lock } from 'lucide-react'
import { YesNo, TextField } from '../Field'
import { medicalConditions, medicalIntro, rsiIntro, rsiQuestions, healthAdminQuestions, medicalFootnotes } from '../../../data/application'

function Group({ title, intro, children }) {
  return (
    <section className="space-y-3">
      <h3 className="font-display text-2xl">{title}</h3>
      {intro && <p className="pb-2 text-[0.95rem] text-ink-soft">{intro}</p>}
      {children}
    </section>
  )
}

export default function MedicalQuestionnaire() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext()
  let n = 0
  return (
    <div className="space-y-12">
      <div className="flex gap-3 rounded-2xl bg-steel-soft/60 p-4 text-sm text-ink-soft">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-steel-deep" aria-hidden="true" />
        <p>
          {medicalIntro} This is health information and is handled as special category data. It is kept only in this
          browser tab until you submit, and is never saved to your device.
        </p>
      </div>

      <Group title="Do you suffer from, or have you ever suffered from, any of the following conditions?">
        {medicalConditions.map((q) => (
          <YesNo key={q.id} number={++n} name={q.id} label={q.label} register={register} error={errors[q.id]?.message} />
        ))}
      </Group>

      <Group title="Repetitive strain injury" intro={rsiIntro}>
        {rsiQuestions.map((q) => (
          <YesNo key={q.id} number={++n} name={q.id} label={q.label} register={register} error={errors[q.id]?.message} />
        ))}
      </Group>

      <Group title="Health checks & absence">
        {healthAdminQuestions.map((q) => (
          <YesNo key={q.id} number={++n} name={q.id} label={q.label} register={register} error={errors[q.id]?.message} />
        ))}
        <div className="rounded-2xl border border-line bg-surface p-5 md:p-6">
          <TextField
            label={`${String(++n).padStart(2, '0')}  Please note the number of sick absences in the past 12 months`}
            required
            inputMode="numeric"
            className="max-w-sm"
            error={errors.sickAbsences?.message}
            {...register('sickAbsences')}
          />
        </div>
        <YesNo
          number={++n}
          name="currentlySick"
          label="Are you sick, or claiming statutory sick pay, at the moment?"
          register={register}
          error={errors.currentlySick?.message}
        />
        <AnimatePresence initial={false}>
          {watch('currentlySick') === 'Yes' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <TextField
                label="If so, what is the period of your sick note?"
                required
                className="pt-2"
                error={errors.sickNotePeriod?.message}
                {...register('sickNotePeriod')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Group>

      <ul className="space-y-1 border-t border-line pt-6 text-sm text-muted">
        {medicalFootnotes.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
    </div>
  )
}
