import Container from './Container'
import Breadcrumbs from './Breadcrumbs'
import SplitText from './SplitText'

export default function LegalLayout({ title, intro, breadcrumbs, children }) {
  return (
    <section className="pb-28 pt-[calc(var(--header-h)+2.5rem)] md:pt-[calc(var(--header-h)+4rem)]">
      <Container>
        <Breadcrumbs items={breadcrumbs} className="mb-10" />
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              <SplitText as="h1" inView={false} className="text-display-lg" parts={title} />
              {intro && <p className="mt-6 text-muted">{intro}</p>}
            </div>
          </div>
          <article className="prose-legal max-w-3xl text-[1.02rem] leading-relaxed lg:col-span-8">{children}</article>
        </div>
      </Container>
    </section>
  )
}
