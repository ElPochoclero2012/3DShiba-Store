import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SITE_URL } from '@/lib/utils/site'

const staticRoutes: MetadataRoute.Sitemap = [
  { url: SITE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
  {
    url: `${SITE_URL}/productos`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  },
  {
    url: `${SITE_URL}/nosotros`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('products').select('id, created_at')
  const products: MetadataRoute.Sitemap = error
    ? []
    : (data ?? []).flatMap((row) => {
        const id = row.id
        if (id == null || id === '') return []
        return [
          {
            url: `${SITE_URL}/productos/${id}`,
            lastModified: row.created_at ? new Date(row.created_at) : undefined,
            changeFrequency: 'weekly',
            priority: 0.7,
          },
        ]
      })

  return [...staticRoutes, ...products]
}
