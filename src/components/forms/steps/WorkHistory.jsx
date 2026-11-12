import { useFieldArray, useFormContext } from 'react-hook-form'
import { AnimatePresence, motion } from 'motion/react'
import { Plus, Trash2 } from 'lucide-react'
import { TextField, TextArea, SelectField, FieldError } from '../Field'
import { countries } from '../../../data/application'
import { emptyWork } from '../../../lib/applicationSchema'

export default function WorkHistory() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext()
  const { fields, append, remove } = useFieldArray({ control, name: 'workHistory' })

  return (
    <div className="space-y-6">
      <p className="text-ink-soft">Starting with your most recent employer, tell us about your work history.</p>
      <AnimatePresence initial={false}>
        {fields.map((field, i) => {
          const e = errors.workHistory?.[i] ?? {}
          return (
            <motion.fieldset
              key={field.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.35 }}
              className="rounded-[1.5rem] border border-line bg-surface p-5 sm:p-8"
            >
              <div className="mb-6 flex items-center justify-between gap-4">
                <legend className="font-display text-2xl">
                  Employer {i + 1}
                  {i === 0 && <span className="ml-2 font-sans text-sm text-muted">(most recent)</span>}
                </legend>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-muted transition-colors hover:bg-rose/10 hover:text-[#B4234A]"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" /> Remove
                    <span className="sr-only"> employer {i + 1}</span>
                  </button>
                )}
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField label="Company" required error={e.company?.message} {...register(`workHistory.${i}.company`)} />
                <TextField label="Job title" required error={e.jobTitle?.message} {...register(`workHistory.${i}.jobTitle`)} />
                <TextField label="Address" required className="sm:col-span-2" error={e.address?.message} {...register(`workHistory.${i}.address`)} />
                <TextField label="Town / City" optional {...register(`workHistory.${i}.city`)} />
                <TextField label="County / State / Province" optional {...register(`workHistory.${i}.region`)} />
                <TextField label="Postcode" optional {...register(`workHistory.${i}.postcode`)} />
                <SelectField label="Country" optional options={countries} {...register(`workHistory.${i}.country`)} />
                <TextArea label="Duties" required rows={4} className="sm:col-span-2" error={e.duties?.message} {...register(`workHistory.${i}.duties`)} />
              </div>
            </motion.fieldset>
          )
        })}
      </AnimatePresence>
      <FieldError message={errors.workHistory?.root?.message || errors.workHistory?.message} />
      <button
        type="button"
        onClick={() => append({ ...emptyWork })}
        className="flex w-full items-center justify-center gap-2 rounded-[1.5rem] border-2 border-dashed border-line py-5 font-semibold text-ink-soft transition-colors hover:border-brand-strong hover:text-brand-strong"
      >
        <Plus className="h-5 w-5" aria-hidden="true" /> Add another employer
      </button>
    </div>
  )
}
