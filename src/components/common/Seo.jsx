import { Helmet } from 'react-helmet-async'
import { SITE_URL } from '../../data/site'

/**
 * Per-page metadata: title, description, canonical, Open Graph, Twitter and
 * optional JSON-LD (breadcrumbs and page-specific schema).
 */
export default function Seo({ title, description, path = '/', image = '/og-image.jpg', breadcrumbs, schema, noindex = false }) {
  const url = `${SITE_URL}${path === '/' ? '/' : path}`
  const fullTitle = title.includes('Acadia Care') ? title : `${title} | Acadia Care`
  const imageUrl = image.startsWith('http') ? image : `${SITE_URL}${image}`

  const graph = []
  if (breadcrumbs?.length) {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [{ name: 'Home', path: '/' }, ...breadcrumbs].map((b, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: b.name,
        item: `${SITE_URL}${b.path === '/' ? '/' : b.path}`,
      })),
    })
  }
  if (schema) graph.push(...(Array.isArray(schema) ? schema : [schema]))

  return (
    <Helmet prioritizeSeoTags>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, follow" />}

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Acadia Care" />
      <meta property="og:locale" content="en_GB" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="A carer and an older woman sharing a warm conversation at Acadia Care" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {graph.length > 0 && (
        <script type="application/ld+json">{JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })}</script>
      )}
    </Helmet>
  )
}
