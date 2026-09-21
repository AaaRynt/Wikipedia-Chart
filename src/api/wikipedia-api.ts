// src/api/wikipedia-api.ts
import type { TSearchResponse } from '@/data/types'

import { isWikipediaProject } from '@/lib/article'

async function search(project: string, keyword: string, signal?: AbortSignal) {
  if (!isWikipediaProject(project)) throw new Error('Invalid Wikipedia project')
  if (!keyword.trim()) return []

  const url = new URL(`https://${project}.org/w/api.php`)
  url.search = new URLSearchParams({
    action: 'query',
    format: 'json',
    generator: 'prefixsearch',
    prop: 'pageprops|pageimages|description',
    redirects: '1',
    ppprop: 'wikibase_item',
    piprop: 'thumbnail',
    pithumbsize: '100',
    pilimit: '10',
    gpssearch: keyword.trim(),
    gpsnamespace: '0',
    gpslimit: '10',
    origin: '*',
  }).toString()

  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error(`Search failed (HTTP ${response.status})`)
  const data = (await response.json()) as TSearchResponse
  if (data.error) throw new Error(data.error.info || 'Wikipedia search failed')
  return Object.values(data.query?.pages ?? {}).sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
}

export const wikipediaApi = { search }
