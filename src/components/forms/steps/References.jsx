import { useFieldArray, useFormContext } from 'react-hook-form'
import { AnimatePresence, motion } from 'motion/react'
import { Plus, Trash2 } from 'lucide-react'
import { TextField, SelectField, FieldError } from '../Field'
import { countries, referencesIntro } from '../../../data/application'
import { emptyReference } from '../../../lib/applicationSchema'

export default function References() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext()
  const { fields, append, remove } = useFieldArray({ control, name: 'references' })

  return (
    <div className="space-y-6">
      <p className="text-ink-soft">{referencesIntro}</p>
      <AnimatePresence initial={false}>
        {fields.map((field, i) => {
          const e = errors.references?.[i] ?? {}
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
                  Referee {i + 1}
                  {i === 0 && <span className="ml-2 font-sans text-sm text-muted">(most recent employer)</span>}
                </legend>
                {fields.length > 2 && (
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-muted transition-colors hover:bg-rose/10 hover:text-[#B4234A]"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" /> Remove
                    <span className="sr-only"> referee {i + 1}</span>
                  </button>
                )}
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField label="Name" required error={e.name?.message} {...register(`references.${i}.name`)} />
                <TextField
                  label="Your job title"
                  required
                  hint="Your role when this person knew you"
                  error={e.applicantJobTitle?.message}
                  {...register(`references.${i}.applicantJobTitle`)}
                />
                <TextField label="Address" required className="sm:col-span-2" error={e.address?.message} {...register(`references.${i}.address`)} />
                <TextField label="Town / City" optional {...register(`references.${i}.city`)} />
                <TextField label="County / State / Province" optional {...register(`references.${i}.region`)} />
                <TextField label="Postcode" optional {...register(`references.${i}.postcode`)} />
                <SelectField label="Country" optional options={countries} {...register(`references.${i}.country`)} />
                <TextField label="Phone (if known)" type="tel" optional inputMode="tel" error={e.phone?.message} {...register(`references.${i}.phone`)} />
                <TextField label="Email (if known)" type="email" optional inputMode="email" error={e.email?.message} {...register(`references.${i}.email`)} />
              </div>
            </motion.fieldset>
          )
        })}
      </AnimatePresence>
      <FieldError message={errors.references?.root?.message || errors.references?.message} />
      <button
        type="button"
        onClick={() => append({ ...emptyReference })}
        className="flex w-full items-center justify-center gap-2 rounded-[1.5rem] border-2 border-dashed border-line py-5 font-semibold text-ink-soft transition-colors hover:border-brand-strong hover:text-brand-strong"
      >
        <Plus className="h-5 w-5" aria-hidden="true" /> Add another referee
      </button>
    </div>
  )
}
