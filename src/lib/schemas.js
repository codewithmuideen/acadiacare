import { z } from 'zod'

const ukPhone = /^[+()\d\s-]{7,20}$/

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name').max(100),
  email: z.string().trim().email('Please enter a valid email address').max(200),
  phone: z
    .string()
    .trim()
    .min(1, 'Please enter a phone number')
    .regex(ukPhone, 'Please enter a valid phone number'),
  subject: z.string().trim().min(2, 'Please choose or enter a subject').max(150),
  message: z.string().trim().min(10, 'Please tell us a little more (at least 10 characters)').max(5000),
  // Honeypot: real people never see or fill this field
  website: z.string().max(0).optional().or(z.literal('')),
})

export const contactSubjects = [
  'General enquiry',
  'Residential care support',
  'Domiciliary care',
  'Staffing requirements',
  'Recruitment / working with us',
]
