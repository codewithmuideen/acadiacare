/**
 * Application form structure, recreated from the existing
 * https://acadiacare.co.uk/application/ form. Every original question is
 * preserved; obvious spelling errors have been corrected
 * (e.g. "conditioned" → "conditions", "Hemia" → "Hernia", "alergies" → "allergies").
 */

export const titles = ['Mr', 'Mrs', 'Ms', 'Miss', 'Mx', 'Dr', 'Other']

export const backgroundQuestions = [
  { id: 'dbsCurrent', label: 'Do you hold a current DBS check?' },
  {
    id: 'unspentConvictions',
    label: 'Do you have an unspent conviction under the Rehabilitation of Offenders Act 1974?',
    detailsId: 'unspentDetails',
    detailsLabel: 'If yes, please give details of the unspent conviction',
  },
  {
    id: 'spentConvictions',
    label: 'Do you have any spent convictions under the Rehabilitation of Offenders Act 1974?',
    detailsId: 'spentDetails',
    detailsLabel: 'If yes, please give details of the conviction',
  },
  { id: 'pendingProsecutions', label: 'Do you have any pending prosecutions?' },
]

export const medicalIntro =
  'Acadia Care must ensure that all temporary workers have an understanding and are aware of their responsibilities towards health and safety. Therefore, we require all applicants to fill out the following questions for their own safety and the safety of the people they are working with.'

export const medicalConditions = [
  { id: 'epilepsy', label: 'Epilepsy, blackouts, fits, migraines, severe headaches, fainting, etc.?' },
  { id: 'sinusitis', label: 'Sinusitis?' },
  { id: 'breakdowns', label: 'Mental or nervous breakdowns?' },
  { id: 'lungDisease', label: 'Lung disease, including asthma, bronchitis or tuberculosis?' },
  { id: 'abdominal', label: 'Abdominal condition, including hernia?' },
  { id: 'refusedWork', label: 'Have you ever been refused work on medical grounds?' },
  { id: 'ear', label: 'Ear conditions, including deafness?' },
  { id: 'vision', label: 'Impaired vision not corrected by lenses?' },
  { id: 'colourBlind', label: 'Colour blindness?' },
  { id: 'skin', label: 'Skin allergies, including dermatitis and eczema?' },
  {
    id: 'heart',
    label: 'Heart disease, high blood pressure, low blood pressure, or any other problems that affect your work efficiency?',
  },
  { id: 'rheumatic', label: 'Rheumatic fever, rheumatism or arthritis?' },
  { id: 'typhoid', label: 'Typhoid or paratyphoid?' },
  { id: 'dysentery', label: 'Dysentery?' },
  { id: 'jaundice', label: 'Jaundice, hepatitis, or any other ailments of the stomach, bowels or digestion?' },
  { id: 'nervous', label: 'Disease of the nervous system?' },
  { id: 'back', label: 'Back strain, disc trouble, hernia or difficulty with bending or lifting?' },
]

export const rsiIntro =
  'The nature of some of the work undertaken by Acadia Care temporary staff may carry a small risk of repetitive strain injury (inflammation of tendons in the arms, neck and hands, caused by repeated movements over a length of time). Therefore, it is important that you answer the following questions.'

export const rsiQuestions = [
  { id: 'neckShoulder', label: 'Do you, or have you ever, suffered from neck or shoulder pain radiating towards your elbows?' },
  { id: 'wrists', label: 'Have you ever suffered from pain in your wrists?' },
  { id: 'vibrationWhiteFinger', label: 'Have you had a history of vibration white finger?' },
  { id: 'backPainAbsence', label: 'Have you ever had time off work due to back pain, back injury or sciatica?' },
]

export const healthAdminQuestions = [
  { id: 'medicalExam', label: 'Are you able to attend a medical examination if required?' },
  { id: 'nightHealthCheck', label: 'If you are to work a night shift, do you require a health check?' },
  {
    id: 'informChanges',
    label: 'Do you agree to inform Acadia Care if you develop any medical conditions during your assignment with us?',
  },
  { id: 'longTermAbsence', label: 'Have you had any long-term absences in the last 3 years?' },
]

export const medicalFootnotes = [
  'You may be requested to re-complete these questions in the future, e.g. in the case of a re-registration.',
  'If there is any change to these answers in the future, we must be informed immediately.',
]

export const jobTypes = ['A temporary job', 'A permanent job', 'Both']
export const workDays = ['Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun']
export const workTimes = ['Days', 'Nights', 'Morning', 'Evening']
export const transport = ['Car', 'Bicycle', 'Motorcycle', 'Lift', 'Public transport', 'Foot']

/**
 * Original consent wording referenced the Data Protection Act 1998, which was
 * replaced by the UK GDPR and the Data Protection Act 2018. The wording below
 * keeps the original meaning but references current legislation.
 * LEGAL REVIEW REQUIRED before launch — see docs/SECURE-APPLICATION-SUBMISSION.md.
 */
export const consentText =
  'Some information provided in this form may be classed as sensitive (special category) data under the UK GDPR and the Data Protection Act 2018. For this we require your explicit consent to hold this information. By signing the declaration, you are consenting to us holding and processing this data in accordance with data protection law, and that we have your authorisation to disclose relevant details to a third party where necessary.'

export const declarationText =
  'I confirm that the information provided is true, and that you may have authorisation to seek references and to approach any government bodies to undertake any relevant checks on me as required.'

export const referencesIntro =
  'Please give details of two or more people/companies to whom we may refer. One of these should be your most recent employer, and preferably both should be professional.'

export const countries = [
  'United Kingdom', 'Ireland', '──────────',
  'Afghanistan', 'Åland Islands', 'Albania', 'Algeria', 'American Samoa', 'Andorra', 'Angola', 'Anguilla', 'Antarctica', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Aruba', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bermuda', 'Bhutan', 'Bolivia', 'Bonaire, Sint Eustatius and Saba', 'Bosnia and Herzegovina', 'Botswana', 'Bouvet Island', 'Brazil', 'British Indian Ocean Territory', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Côte d’Ivoire', 'Cambodia', 'Cameroon', 'Canada', 'Cape Verde', 'Cayman Islands', 'Central African Republic', 'Chad', 'Chile', 'China', 'Christmas Island', 'Cocos (Keeling) Islands', 'Colombia', 'Comoros', 'Congo', 'Cook Islands', 'Costa Rica', 'Croatia', 'Cuba', 'Curaçao', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Falkland Islands (Malvinas)', 'Faroe Islands', 'Fiji', 'Finland', 'France', 'French Guiana', 'French Polynesia', 'French Southern Territories', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Gibraltar', 'Greece', 'Greenland', 'Grenada', 'Guadeloupe', 'Guam', 'Guatemala', 'Guernsey', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Heard Island and McDonald Islands', 'Holy See', 'Honduras', 'Hong Kong', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Isle of Man', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jersey', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kosovo', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Macao', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Martinique', 'Mauritania', 'Mauritius', 'Mayotte', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Montserrat', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Caledonia', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'Niue', 'Norfolk Island', 'North Korea', 'North Macedonia', 'Northern Mariana Islands', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Pitcairn', 'Poland', 'Portugal', 'Puerto Rico', 'Qatar', 'Réunion', 'Romania', 'Russia', 'Rwanda', 'Saint Barthélemy', 'Saint Helena, Ascension and Tristan da Cunha', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Martin (French part)', 'Saint Pierre and Miquelon', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Sint Maarten (Dutch part)', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Georgia and the South Sandwich Islands', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Svalbard and Jan Mayen', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tokelau', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Turks and Caicos Islands', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United States', 'United States Minor Outlying Islands', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Venezuela', 'Vietnam', 'Virgin Islands, British', 'Virgin Islands, U.S.', 'Wallis and Futuna', 'Western Sahara', 'Yemen', 'Zambia', 'Zimbabwe',
]
