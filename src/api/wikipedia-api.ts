// src/api/wikipedia-api.ts
import type { TArticle, TSearchResponse } from '@/data/types'

import { isWikipediaProject, normalizeArticleTitle } from '@/lib/article'

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

async function resolveArticle(target: TArticle, signal?: AbortSignal): Promise<TArticle | null> {
  if (!isWikipediaProject(target.project)) throw new Error('Invalid Wikipedia project')
  const url = new URL(`https://${target.project}.org/w/api.php`)
  url.search = new URLSearchParams({ action: 'query', format: 'json', titles: target.article, redirects: '1', prop: 'pageprops', ppprop: 'wikibase_item', origin: '*' }).toString()
  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error(`Article lookup failed (HTTP ${response.status})`)
  const data = (await response.json()) as TSearchResponse
  if (data.error) throw new Error(data.error.info || 'Article lookup failed')
  const page = Object.values(data.query?.pages ?? {})[0]
  if (!page || page.missing !== undefined || page.invalid !== undefined) return null
  if (typeof page.title !== 'string') throw new Error('Invalid article response')
  const entityId = page.pageprops?.wikibase_item
  return { project: target.project, article: normalizeArticleTitle(page.title), ...(entityId && /^Q[1-9]\d*$/.test(entityId) ? { entityId } : {}) }
}

export const wikipediaApi = { search, resolveArticle }
