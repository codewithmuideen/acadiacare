import { useFormContext } from 'react-hook-form'
import { AnimatePresence, motion } from 'motion/react'
import { Info } from 'lucide-react'
import { YesNo, TextArea } from '../Field'
import { backgroundQuestions } from '../../../data/application'

export default function BackgroundChecks() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext()
  return (
    <div className="space-y-4">
      <p className="mb-6 flex gap-3 rounded-2xl bg-steel-soft/60 p-4 text-sm text-ink-soft">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-steel-deep" aria-hidden="true" />
        Answers about convictions are treated as highly sensitive and are only used to assess your suitability for care work.
      </p>
      {backgroundQuestions.map((q, i) => (
        <div key={q.id}>
          <YesNo number={i + 1} name={q.id} label={q.label} register={register} error={errors[q.id]?.message} />
          {q.detailsId && (
            <AnimatePresence initial={false}>
              {watch(q.id) === 'Yes' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <TextArea
                    label={q.detailsLabel}
                    required
                    rows={4}
                    className="pt-4"
                    error={errors[q.detailsId]?.message}
                    {...register(q.detailsId)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      ))}
    </div>
  )
}
