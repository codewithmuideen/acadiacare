import { z } from 'zod'
import { backgroundQuestions, medicalConditions, rsiQuestions, healthAdminQuestions } from '../data/application'

const req = (msg) => z.string().trim().min(1, msg)
const yesNo = z.enum(['Yes', 'No'], { error: 'Please choose Yes or No' })
const phone = z
  .string()
  .trim()
  .min(1, 'Please enter a phone number')
  .regex(/^[+()\d\s-]{7,20}$/, 'Please enter a valid phone number')

const address = {
  address: req('Please enter the address'),
  city: z.string().trim().max(120).optional(),
  region: z.string().trim().max(120).optional(),
  postcode: z.string().trim().max(20).optional(),
  country: z.string().trim().max(120).optional(),
}

export const emptyWork = { company: '', address: '', city: '', region: '', postcode: '', country: 'United Kingdom', jobTitle: '', duties: '' }
export const emptyReference = {
  name: '',
  address: '',
  city: '',
  region: '',
  postcode: '',
  country: 'United Kingdom',
  phone: '',
  email: '',
  applicantJobTitle: '',
}

const workEntry = z.object({
  company: req('Please enter the company name'),
  ...address,
  jobTitle: req('Please enter your job title'),
  duties: req('Please describe your duties').max(3000),
})

const referenceEntry = z.object({
  name: req('Please enter the referee’s name'),
  ...address,
  phone: z
    .string()
    .trim()
    .regex(/^$|^[+()\d\s-]{7,20}$/, 'Please enter a valid phone number')
    .optional(),
  email: z.string().trim().email('Please enter a valid email').optional().or(z.literal('')),
  applicantJobTitle: req('Please enter your job title with this referee'),
})

const yesNoFields = (list) => Object.fromEntries(list.map((q) => [q.id, yesNo]))

export const applicationSchema = z
  .object({
    // Step 1: personal
    title: z.string().optional(),
    surname: req('Please enter your surname'),
    forename: req('Please enter your forename'),
    address1: req('Please enter the first line of your address'),
    address2: z.string().trim().optional(),
    city: req('Please enter your town or city'),
    region: z.string().trim().optional(),
    postcode: req('Please enter your postcode'),
    country: req('Please choose your country'),
    email: z.string().trim().email('Please enter a valid email address'),
    phone,
    emergencyName: req('Please enter an emergency contact name'),
    emergencyPhone: phone,

    // Step 2: background checks
    ...yesNoFields(backgroundQuestions),
    unspentDetails: z.string().trim().max(3000).optional(),
    spentDetails: z.string().trim().max(3000).optional(),

    // Step 3 & 4
    workHistory: z.array(workEntry).min(1, 'Please add at least one employer'),
    references: z.array(referenceEntry).min(2, 'Please give details of two or more referees'),

    // Step 5: medical
    ...yesNoFields(medicalConditions),
    ...yesNoFields(rsiQuestions),
    ...yesNoFields(healthAdminQuestions),
    sickAbsences: z
      .string()
      .trim()
      .min(1, 'Please enter a number (0 if none)')
      .regex(/^\d{1,3}$/, 'Please enter a whole number'),
    currentlySick: yesNo,
    sickNotePeriod: z.string().trim().max(200).optional(),

    // Step 6: preferences (optional in the original form)
    jobType: z.string().optional().nullable(),
    workDays: z.array(z.string()).optional(),
    workTimes: z.array(z.string()).optional(),
    transport: z.array(z.string()).optional(),

    // Step 7: declaration
    consent: z.literal(true, { error: 'Your explicit consent is required to process this application' }),
    declaration: z.literal(true, { error: 'Please confirm the declaration' }),
    signature: req('Please type your full name to sign'),
  })
  .superRefine((v, ctx) => {
    if (v.unspentConvictions === 'Yes' && !v.unspentDetails?.trim())
      ctx.addIssue({ code: 'custom', path: ['unspentDetails'], message: 'Please give details of the unspent conviction' })
    if (v.spentConvictions === 'Yes' && !v.spentDetails?.trim())
      ctx.addIssue({ code: 'custom', path: ['spentDetails'], message: 'Please give details of the conviction' })
    if (v.currentlySick === 'Yes' && !v.sickNotePeriod?.trim())
      ctx.addIssue({ code: 'custom', path: ['sickNotePeriod'], message: 'Please tell us the period of your sick note' })
  })

const ids = (list) => list.map((q) => q.id)

/** Fields validated when leaving each step. */
export const stepFields = {
  personal: ['surname', 'forename', 'address1', 'city', 'postcode', 'country', 'email', 'phone', 'emergencyName', 'emergencyPhone'],
  background: [...ids(backgroundQuestions), 'unspentDetails', 'spentDetails'],
  work: ['workHistory'],
  references: ['references'],
  medical: [...ids(medicalConditions), ...ids(rsiQuestions), ...ids(healthAdminQuestions), 'sickAbsences', 'currentlySick', 'sickNotePeriod'],
  preferences: [],
  declaration: ['consent', 'declaration', 'signature'],
  review: [],
}

export const defaultValues = {
  title: '',
  surname: '',
  forename: '',
  address1: '',
  address2: '',
  city: '',
  region: '',
  postcode: '',
  country: 'United Kingdom',
  email: '',
  phone: '',
  emergencyName: '',
  emergencyPhone: '',
  unspentDetails: '',
  spentDetails: '',
  workHistory: [emptyWork],
  references: [emptyReference, emptyReference],
  sickAbsences: '',
  sickNotePeriod: '',
  jobType: null,
  workDays: [],
  workTimes: [],
  transport: [],
  consent: false,
  declaration: false,
  signature: '',
}
