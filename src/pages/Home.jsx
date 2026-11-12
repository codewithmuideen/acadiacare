import Seo from '../components/common/Seo'
import Hero from '../components/home/Hero'
import Introduction from '../components/home/Introduction'
import AboutPreview from '../components/home/AboutPreview'
import ServicesOverview from '../components/home/ServicesOverview'
import WhyChooseUs from '../components/home/WhyChooseUs'
import CareApproach from '../components/home/CareApproach'
import ScrollWorld from '../components/home/ScrollWorld'
import StaffingCTA from '../components/home/StaffingCTA'
import CareersCTA from '../components/home/CareersCTA'
import ContactSection from '../components/home/ContactSection'
import { SITE_URL, offices } from '../data/site'

const kent = offices.find((o) => o.id === 'kent')

/** LocalBusiness only for the Kent office, the only office with a published street address. */
const schema = [
  {
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/#kent-office`,
    name: kent.name,
    parentOrganization: { '@id': `${SITE_URL}/#organization` },
    url: `${SITE_URL}/contact-acadia-care`,
    telephone: '+441634610396',
    email: kent.email,
    image: `${SITE_URL}/og-image.jpg`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: '135 High Street',
      addressLocality: 'Rainham',
      addressRegion: 'Kent',
      postalCode: 'ME8 8BD',
      addressCountry: 'GB',
    },
  },
]

export default function Home() {
  return (
    <>
      <Seo
        title="Acadia Care | Care Services & Support Workers in Staffordshire"
        description="Acadia Support Services Ltd provides residential care support, domiciliary care and healthcare staffing, including bank, temporary and contract support workers and care assistants across Staffordshire."
        path="/"
        schema={schema}
      />
      <Hero />
      <Introduction />
      <AboutPreview />
      <ServicesOverview />
      <WhyChooseUs />
      <CareApproach />
      <ScrollWorld />
      <StaffingCTA />
      <CareersCTA />
      <ContactSection />
    </>
  )
}
