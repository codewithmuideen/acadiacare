import { Link } from 'react-router-dom'
import Seo from '../components/common/Seo'
import LegalLayout from '../components/common/LegalLayout'

/**
 * Wording preserved from the existing acadiacare.co.uk privacy policy.
 * NOTE FOR THE CLIENT: the original policy references the Data Protection Act
 * 1998, which has been replaced by the UK GDPR and the Data Protection Act 2018,
 * and it does not yet cover the staff application form (special category data).
 * It should be reviewed by a qualified adviser before launch. See README.
 */
export default function PrivacyPolicy() {
  const breadcrumbs = [{ name: 'Privacy Policy', path: '/privacy-policy' }]
  return (
    <>
      <Seo
        title="Privacy Policy"
        description="The privacy policy of the Acadia Care website: what information we collect, how we use it and your rights."
        path="/privacy-policy"
        breadcrumbs={breadcrumbs}
      />
      <LegalLayout title="Privacy Policy" intro="The following is the privacy policy of this website, www.acadiacare.co.uk." breadcrumbs={breadcrumbs}>
        <h2>1. Who we are</h2>
        <p>In this Privacy Policy, references to “we” and “us” are to Acadia Care.</p>

        <h2>2. What information we collect and how</h2>
        <p>The information we collect via this website may include:</p>
        <ol>
          <li>Any personal details you type in and submit, such as name, email address, telephone number, etc.</li>
          <li>
            Your IP address (this is your computer’s individual identification number), which is automatically logged by
            our web server. This is used to note your interest in our website.
          </li>
          <li>
            Your preferences and use of email updates, recorded by emails we send you (if you select to receive email
            updates on products and offers).
          </li>
          <li>
            Session information stored in cookies. These do not include any personal information and are used to ensure
            the correct data is extracted from the database when using our interactive systems.
          </li>
        </ol>

        <h2>3. What we do with your information</h2>
        <p>
          Any personal information we collect from this website will be used in accordance with the Data Protection Act
          1998 and other applicable laws. The details we collect will be used:
        </p>
        <ol>
          <li>
            We may in certain cases use your email address to send you information on our products and services. In such
            cases you will be offered the option to opt out of receiving future marketing emails.
          </li>
          <li>
            We may need to pass the information we collect to other companies for administrative purposes. We may use third
            parties to carry out certain activities, such as processing and sorting data, monitoring how customers use our
            site and issuing our emails for us. Rest assured that third parties will not be allowed to use your personal
            information for their own purposes.
          </li>
        </ol>

        <h2>4. Your rights</h2>
        <ol>
          <li>
            You can ask us to update or remove your personal information by simply emailing us or writing to us using the
            details on the <Link to="/contact-acadia-care">contact page</Link>.
          </li>
          <li>You also have the right to request a copy of any personal information we hold about you.</li>
        </ol>
      </LegalLayout>
    </>
  )
}
