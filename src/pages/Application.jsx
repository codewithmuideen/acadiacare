import { Clock, FileText, Lock, ShieldCheck, Users } from 'lucide-react'
import Seo from '../components/common/Seo'
import PageHero from '../components/common/PageHero'
import Container from '../components/common/Container'
import Reveal from '../components/common/Reveal'
import ApplicationWizard from '../components/forms/ApplicationWizard'
import { applicationsOpen } from '../lib/submitApplication'
import { primaryPhone } from '../data/site'

const needs = [
  { icon: Users, text: 'Details of two or more referees, including your most recent employer' },
  { icon: FileText, text: 'Your work history, with job titles and duties' },
  { icon: ShieldCheck, text: 'Your DBS status and any convictions under the Rehabilitation of Offenders Act 1974' },
  { icon: Clock, text: 'Around 15 to 20 minutes. Your answers are not saved if you leave the page' },
]

export default function Application() {
  const breadcrumbs = [{ name: 'Careers & Application', path: '/application' }]
  return (
    <>
      <Seo
        title="Careers | Apply to Become a Support Worker or Carer"
        description="Join Acadia Care as a support worker or care assistant in Staffordshire. Competitive rates of pay, work benefits and flexibility. Apply online in a few simple steps."
        path="/application"
        breadcrumbs={breadcrumbs}
      />
      <PageHero
        breadcrumbs={breadcrumbs}
        eyebrow="Careers at Acadia"
        title={['Make a difference,', { text: 'every shift.', className: 'italic text-brand-strong' }]}
        intro="We offer competitive rates of pay, work benefits and flexibility to support workers and carers who are qualified, or working towards a qualification, and experienced in the field of care."
        image="carer-leaning-resident"
        imagePosition="55% 30%"
      />

      <section aria-label="Before you start" className="pb-12">
        <Container>
          <div className="grid gap-6 rounded-[2rem] border border-line bg-surface p-6 sm:p-10 lg:grid-cols-12 lg:gap-10">
            <Reveal className="lg:col-span-4">
              <h2 className="text-display-sm">Before you start</h2>
              <p className="mt-3 text-muted">You’ll be asked for the following. Fields marked * are required.</p>
            </Reveal>
            <ul className="grid gap-5 sm:grid-cols-2 lg:col-span-8">
              {needs.map((n, i) => (
                <Reveal as="li" key={n.text} delay={i * 0.05} className="flex gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-tint text-brand-strong">
                    <n.icon className="h-[18px] w-[18px]" aria-hidden="true" />
                  </span>
                  <span className="pt-2 text-[0.95rem] text-ink-soft">{n.text}</span>
                </Reveal>
              ))}
            </ul>
            <div className="flex gap-3 rounded-2xl bg-steel-soft/60 p-4 text-sm text-ink-soft lg:col-span-12">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-steel-deep" aria-hidden="true" />
              <p>
                This application includes health and criminal record information, which is treated as highly sensitive
                personal data. Your answers stay in this browser tab until you submit them and are never stored on your
                device.
                {!applicationsOpen && (
                  <>
                    {' '}
                    <strong className="font-semibold text-ink">
                      Online submission is being set up. If you would prefer, call us on{' '}
                      <a href={primaryPhone.href} className="underline">
                        {primaryPhone.label}
                      </a>{' '}
                      and we’ll help you apply.
                    </strong>
                  </>
                )}
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section aria-label="Application form" className="pb-28 pt-12 md:pb-36">
        <Container>
          <ApplicationWizard />
        </Container>
      </section>
    </>
  )
}
