/** Public configuration. Only browser-safe values belong here (VITE_ prefixed). */
export const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '')
export const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
export const CMS_ENABLED = /^https?:\/\//.test(SUPABASE_URL) && !!SUPABASE_KEY

export const CACHE_KEY = 'acadia-cms-v1'
export const MEDIA_BUCKET = 'media'
export const APPLICATION_BUCKET = 'applications'

/** Defaults match the HTML. Admins override them in Dashboard → Site settings. */
export const DEFAULT_SETTINGS = {
  phone: '07949 720 932',
  whatsapp: '447949720932',
  email: 'care@acadiacare.co.uk',
  address: 'Whittle Rise, Staffordshire Technology Park, Stafford, ST18 0ES',
  reviewScore: '8.5',
  reviews: 'https://portal.homecare.co.uk/index.cfm/id/65432250790',
  facebook: 'https://www.facebook.com/p/Acadia-Support-100063914539945/',
  instagram: 'https://www.instagram.com/acadiasupportservices',
  linkedin: '',
}

export const DEFAULT_NAV = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Careers', href: '/careers' },
  { label: 'Contact', href: '/contact' },
  { label: 'Reviews', href: 'https://portal.homecare.co.uk/index.cfm/id/65432250790', newTab: true, highlight: true },
]

export const DEFAULT_CTA = { label: 'Apply Now', href: '/careers#apply', show: true }

/** Built-in pages, offered as link targets in the menu editor. */
export const SITE_PAGES = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Live-in Care', href: '/services#live-in' },
  { label: 'Family Share', href: '/family-share' },
  { label: 'Careers', href: '/careers' },
  { label: 'Apply form', href: '/careers#apply' },
  { label: 'Contact', href: '/contact' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms', href: '/terms' },
]
