import { useFormContext } from 'react-hook-form'
import { Pencil } from 'lucide-react'
import { backgroundQuestions, medicalConditions, rsiQuestions, healthAdminQuestions } from '../../../data/application'

function Row({ label, value }) {
  const display = Array.isArray(value) ? (value.length ? value.join(', ') : 'Not provided') : value || 'Not provided'
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] sm:gap-6">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="break-words text-[0.95rem] font-medium text-ink">{display}</dd>
    </div>
  )
}

function Block({ title, step, onEdit, children }) {
  return (
    <section className="rounded-[1.5rem] border border-line bg-surface p-5 sm:p-7">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h3 className="font-display text-2xl">{title}</h3>
        <button
          type="button"
          onClick={() => onEdit(step)}
          className="inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-2 text-sm font-semibold text-ink-soft transition-colors hover:border-brand-strong hover:text-brand-strong"
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Edit <span className="sr-only">{title}</span>
        </button>
      </div>
      <dl className="divide-y divide-line">{children}</dl>
    </section>
  )
}

export default function Review({ onEdit }) {
  const { getValues } = useFormContext()
  const v = getValues()
  const medical = [...medicalConditions, ...rsiQuestions, ...healthAdminQuestions]
  const medicalYes = medical.filter((q) => v[q.id] === 'Yes')

  return (
    <div className="space-y-5">
      <p className="text-ink-soft">Please check your answers. You can go back and edit any section before submitting.</p>

      <Block title="Personal information" step={0} onEdit={onEdit}>
        <Row label="Name" value={[v.title, v.forename, v.surname].filter(Boolean).join(' ')} />
        <Row label="Address" value={[v.address1, v.address2, v.city, v.region, v.postcode, v.country].filter(Boolean).join(', ')} />
        <Row label="Email" value={v.email} />
        <Row label="Phone" value={v.phone} />
        <Row label="Emergency contact" value={`${v.emergencyName} · ${v.emergencyPhone}`} />
      </Block>

      <Block title="Background checks" step={1} onEdit={onEdit}>
        {backgroundQuestions.map((q) => (
          <Row key={q.id} label={q.label} value={v[q.id] + (q.detailsId && v[q.id] === 'Yes' ? `: ${v[q.detailsId]}` : '')} />
        ))}
      </Block>

      <Block title="Work history" step={2} onEdit={onEdit}>
        {v.workHistory.map((w, i) => (
          <Row key={i} label={`Employer ${i + 1}`} value={`${w.jobTitle} at ${w.company}`} />
        ))}
      </Block>

      <Block title="References" step={3} onEdit={onEdit}>
        {v.references.map((r, i) => (
          <Row key={i} label={`Referee ${i + 1}`} value={`${r.name}, ${[r.phone, r.email].filter(Boolean).join(' · ') || r.address}`} />
        ))}
      </Block>

      <Block title="Medical questionnaire" step={4} onEdit={onEdit}>
        <Row label="Questions answered" value={`${medical.filter((q) => v[q.id]).length} of ${medical.length}`} />
        <Row label="Answered “Yes” to" value={medicalYes.length ? medicalYes.map((q) => q.label.replace(/\?$/, '')) : 'None'} />
        <Row label="Sick absences (past 12 months)" value={v.sickAbsences} />
        <Row label="Currently sick / claiming SSP" value={v.currentlySick + (v.currentlySick === 'Yes' ? `: ${v.sickNotePeriod}` : '')} />
      </Block>

      <Block title="Work preferences" step={5} onEdit={onEdit}>
        <Row label="Looking for" value={v.jobType} />
        <Row label="Preferred days" value={v.workDays} />
        <Row label="Preferred times" value={v.workTimes} />
        <Row label="Transport" value={v.transport} />
      </Block>

      <Block title="Declaration" step={6} onEdit={onEdit}>
        <Row label="Data protection consent" value={v.consent ? 'Given' : 'Not given'} />
        <Row label="Declaration" value={v.declaration ? 'Confirmed' : 'Not confirmed'} />
        <Row label="Signed" value={v.signature} />
      </Block>
    </div>
  )
}
