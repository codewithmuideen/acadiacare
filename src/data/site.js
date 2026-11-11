/**
 * Site content. Copy is taken from the existing acadiacare.co.uk website
 * (crawled November 2026). Grammar has only been lightly corrected where the
 * meaning is unchanged. Do not add claims here that the client has not verified.
 */

export const SITE_URL = 'https://acadiacare.co.uk'

export const company = {
  name: 'Acadia Care',
  legalName: 'Acadia Support Services Ltd',
  tagline: 'A trusted care service',
  established: '2013',
  foundedIn: 'Buckinghamshire, England',
  region: 'Staffordshire',
  officeHours: '9.00am to 5.30pm, Monday to Friday',
  regulator: 'The Care Quality Commission (CQC)',
}

export const offices = [
  {
    id: 'stafford',
    name: 'Acadia Support + Services Stafford',
    short: 'Stafford',
    address: null, // Not published on the existing website
    phones: [{ label: '01785 747 225', href: 'tel:+441785747225' }],
    email: 'care@acadiacare.co.uk',
  },
  {
    id: 'kent',
    name: 'Acadia Support Kent',
    short: 'Kent',
    address: ['135 High Street', 'Rainham', 'ME8 8BD'],
    phones: [
      { label: '01634 610396', href: 'tel:+441634610396' },
      { label: '+44 7898 740987', href: 'tel:+447898740987' },
    ],
    email: 'acadia.kent@acadiacare.co.uk',
    mapQuery: '135 High Street, Rainham, ME8 8BD',
  },
]

export const primaryPhone = offices[0].phones[0]
export const primaryEmail = offices[0].email

export const nav = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about-acadia-care' },
  { label: 'Services', to: '/services' },
  { label: 'Careers', to: '/application' },
  { label: 'Contact', to: '/contact-acadia-care' },
]

export const legalNav = [
  { label: 'Privacy Policy', to: '/privacy-policy' },
  { label: 'Terms & Conditions', to: '/terms-and-conditions' },
]

export const intro = {
  lead: 'Designed to provide the highest standard of care across the whole social care spectrum, Acadia Support Services Ltd specialises in the recruitment of support workers and carers.',
  body: 'We offer an innovative and proficient service which provides a solution for staffing needs in the health and social care of individuals that are in nursing homes, residential supported living as well as domiciliary care programmes for those needing care in Staffordshire county.',
  settings: ['Nursing homes', 'Residential supported living', 'Domiciliary care programmes'],
}

export const history = {
  p1: 'Acadia Support Services Ltd was established in 2013 in Buckinghamshire, England. From the beginning, we have always fully focused on giving the best quality service of care, and we continue to stand resolutely with our unchanging focus on quality.',
  p2: 'Today we are still able to provide our clients with carers and support workers in Staffordshire County, offering compassionate and professional care for the elderly in nursing homes, individuals convalescing in the comfort of their own homes, as well as disabled adults who may require extra support to help them live independently.',
}

export const whoWeAre = {
  p1: `${intro.lead} ${intro.body}`,
  conditions: [
    'Mental health related illnesses',
    'Learning disabilities',
    'Dementia',
    'Autism',
    'Brain trauma',
    'Special needs',
  ],
  respect:
    'We understand and respect the needs of individuals from various ethnic and religious backgrounds, such as dietary requirements.',
  language:
    'We also recognise that language may act as a barrier to communication, and so we aim to increase communication between the service users and our employees by offering communication skills training.',
  personCentred:
    'Our newly opened Stafford branch and team of employees are committed to making the experience of the users satisfactory by ensuring that it is person centred and has the client’s utmost needs at the heart of its approach.',
  tailored:
    'At Acadia Support Services Ltd, we provide our customers with a service that is responsively tailored to the individual’s care needs and one that promotes independence, respects the user’s dignity and accepts your choice of care.',
  apps: 'We have created mobile applications to support you with professionally trained staff so that clients and their families can rest assured that the care they need is professional whilst adhering to all social care standards.',
  retention:
    'We minimise staff absentees by offering competitive rates of pay, work benefits and flexibility that motivates them to complete their contracted hours of work.',
  vetting:
    'All carers and support workers at Acadia Support Services Ltd undergo an intensive interview, are reference checked and vetted through Enhanced DBS, thereby fully adhering to the minimum requirement set out by CQC regulations.',
  hours:
    'For more information and questions about our care packages, please contact our office during opening hours, which are 9.00am to 5.30pm, Monday to Friday. Our friendly team are happy to help and respond to all messages during office hours.',
}

export const promises = [
  'To ensure that our clients receive the utmost care tailored to their individual needs, and ensure that they retain their dignity and independence in a nursing home or whilst living independently.',
  'To offer you, the client and your family, professionals that are appropriately skilled to match your requirements as closely and as quickly as possible.',
  'To offer flexibility in line with the client’s circumstances and their needs, whilst ensuring a smooth service that is effective.',
]

export const services = [
  {
    id: 'residential-care-support',
    number: '01',
    title: 'Residential Care Support',
    short:
      'Individually focused residential care and support for the elderly and young alike with physical or learning disabilities, as well as all other needs associated with social care.',
    image: 'colouring-activity',
    paragraphs: [
      'Acadia Support Services Ltd provides individually focused residential care and support for the elderly and young alike with physical or learning disabilities as well as all other needs that are associated with social care.',
      'We train our staff so that they can encourage the client to take an active part in their own life, such as the decision of choice of food to eat from the menu.',
      'Acadia Support Services Ltd is registered with the regulatory body The Care Quality Commission (CQC) and works towards providing high standards of compliance in the care industry. In addition, our internal employees based at the Stafford office have their own built-in system that helps assess the quality of staff that are employed, so that every individual in our care maintains a dignified and meaningful life.',
    ],
    highlights: ['Physical & learning disabilities', 'Choice in daily life', 'CQC registered'],
    enquiry: 'Residential care support',
  },
  {
    id: 'domiciliary-care',
    number: '02',
    title: 'Domiciliary Care',
    short:
      'Carers and support workers who help those with caring needs remain in the comfort of their own home, either indefinitely or for longer than previously expected.',
    image: 'photo-album-home',
    paragraphs: [
      'As an alternative to residential and nursing care, we provide carers and support workers to individuals in domiciliary care to ensure that those with caring needs remain in the comfort of their own home, either indefinitely or for a longer period than previously expected.',
      'Our employees understand and have undergone comprehensive training that ensures that they respect the boundaries between the client and themselves.',
    ],
    highlights: ['Care in your own home', 'Alternative to residential care', 'Respectful boundaries'],
    enquiry: 'Domiciliary care',
  },
  {
    id: 'staffing-queries',
    number: '03',
    title: 'Staffing Solutions',
    short:
      'Bank, temporary or contract Support Workers and Care Assistants — within a few hours if necessary, and for any length of time.',
    image: 'carer-leaning-resident',
    paragraphs: [
      'Please ensure that you book an appointment with us so that you are familiar with the type of care we provide. We are equally interested in learning more about your company culture and ethics so that we can be up to date with the kind of service you require.',
      'We can provide bank, temporary or contract Support Workers and Care Assistants within a few hours if necessary and for any length of time.',
      'We take pride in our staff, who are either qualified or working towards a qualification, but experienced in the field of care. Our team of committed customer services staff are friendly and reliable, and work hard to ensure that your needs are accommodated.',
    ],
    highlights: ['Bank, temporary & contract', 'Within hours if necessary', 'Any length of time'],
    enquiry: 'Staffing requirements',
  },
]

export const whyChoose = [
  {
    icon: 'HeartHandshake',
    title: 'Person-centred approach',
    text: 'The client’s utmost needs are at the heart of our approach.',
  },
  {
    icon: 'GraduationCap',
    title: 'Professionally trained staff',
    text: 'Staff who are qualified or working towards a qualification, and experienced in the field of care.',
  },
  {
    icon: 'ShieldCheck',
    title: 'Enhanced DBS checks',
    text: 'Every carer is interviewed, reference checked and vetted through Enhanced DBS.',
  },
  {
    icon: 'Sparkles',
    title: 'Individual dignity',
    text: 'A service that respects each person’s dignity and accepts their choice of care.',
  },
  {
    icon: 'Footprints',
    title: 'Independence',
    text: 'Support that promotes independence, at home or in a nursing home.',
  },
  {
    icon: 'CalendarClock',
    title: 'Flexible staffing',
    text: 'Bank, temporary or contract staff, for any length of time.',
  },
  {
    icon: 'MessagesSquare',
    title: 'Communication skills',
    text: 'Communication skills training to reduce language barriers between service users and staff.',
  },
  {
    icon: 'BadgeCheck',
    title: 'Quality-focused care',
    text: 'Registered with the CQC and working towards high standards of compliance.',
  },
]

export const approach = [
  {
    title: 'Understand individual needs',
    text: 'We understand and respect the needs of individuals from various ethnic and religious backgrounds, such as dietary requirements.',
  },
  {
    title: 'Match appropriate support',
    text: 'Professionals that are appropriately skilled to match your requirements as closely and as quickly as possible.',
  },
  {
    title: 'Deliver professional care',
    text: 'Professionally trained staff, so that clients and their families can rest assured the care is professional and adheres to social care standards.',
  },
  {
    title: 'Maintain dignity and independence',
    text: 'A service that promotes independence, respects the user’s dignity and accepts your choice of care.',
  },
]

export const values = ['Compassion', 'Dignity', 'Independence', 'Person-centred', 'Respect', 'Professional care', 'Choice']

/** FAQ answers only restate information published on the existing website. */
export const faqs = [
  {
    q: 'Which areas does Acadia Care support?',
    a: 'We provide carers and support workers to individuals in nursing homes, residential supported living and domiciliary care programmes in Staffordshire county. We also have an office in Rainham, Kent.',
  },
  {
    q: 'Who do your services support?',
    a: 'Our services are extended to the elderly and young alike, including individuals with mental health related illnesses, learning disabilities, dementia, autism, brain trauma and special needs.',
  },
  {
    q: 'How quickly can you provide staff?',
    a: 'We can provide bank, temporary or contract Support Workers and Care Assistants within a few hours if necessary, and for any length of time.',
  },
  {
    q: 'How are your carers and support workers vetted?',
    a: 'All carers and support workers undergo an intensive interview, are reference checked and vetted through Enhanced DBS, fully adhering to the minimum requirement set out by CQC regulations.',
  },
  {
    q: 'How do I arrange staffing for my organisation?',
    a: 'Please book an appointment with us so that you are familiar with the type of care we provide. We are equally interested in learning about your company culture and ethics so we understand the service you require.',
  },
  {
    q: 'When is your office open?',
    a: 'Our office is open 9.00am to 5.30pm, Monday to Friday. Our friendly team respond to all messages during office hours.',
  },
]
