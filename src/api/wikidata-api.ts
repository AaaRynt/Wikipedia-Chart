// src/api/wikidata-api.ts

import type { TArticle, TLanguageMapping } from '@/data/types'

import { wikipediaApi } from '@/api/wikipedia-api'
import { wikipediaLanguages } from '@/data/languages'
import { normalizeArticleTitle } from '@/lib/article'

type TWikidataResponse = {
  error?: { info?: string }
  entities?: Record<string, { id?: string; missing?: string; sitelinks?: Record<string, { title?: string }> }>
}

async function getLanguageVersions(target: TArticle, signal?: AbortSignal): Promise<TLanguageMapping> {
  // Resolve the actual page so presets, redirects and shared QIDs use Wikipedia's current identity.
  const source = await wikipediaApi.resolveArticle(target, signal)
  signal?.throwIfAborted()
  if (!source) return { source: target, versions: [], unavailable: 'missing-page' }
  if (!source.entityId) return { source, versions: [source], unavailable: 'no-entity' }

  const url = new URL('https://www.wikidata.org/w/api.php')
  url.search = new URLSearchParams({ action: 'wbgetentities', format: 'json', ids: source.entityId, props: 'sitelinks', origin: '*' }).toString()
  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error(`Language lookup failed (HTTP ${response.status})`)
  const data = (await response.json()) as TWikidataResponse
  signal?.throwIfAborted()
  if (data.error) throw new Error(data.error.info || 'Wikidata lookup failed')
  const entity = data.entities?.[source.entityId]
  if (!entity) throw new Error('Invalid Wikidata response')
  if (entity.missing !== undefined) return { source, versions: [source], unavailable: 'missing-entity' }
  if (!entity.sitelinks || typeof entity.sitelinks !== 'object' || Array.isArray(entity.sitelinks)) throw new Error('Invalid language links')

  const versions: TArticle[] = wikipediaLanguages.flatMap((language) => {
    const title = entity.sitelinks?.[language.siteId]?.title
    return typeof title === 'string' && title.trim() ? [{ project: language.project, article: normalizeArticleTitle(title), entityId: source.entityId }] : []
  })
  const canonicalSource = versions.find((version) => version.project === source.project) ?? source
  if (!versions.some((version) => version.project === source.project)) versions.unshift(source)
  return { source: canonicalSource, versions }
}

export const wikidataApi = { getLanguageVersions }
