// src/lib/language-comparison.test.ts

import { expect, it, vi } from 'vitest'

import type { TQuery } from '@/data/types'

import { pageviewsApi } from '@/api/pageviews-api'
import { wikidataApi } from '@/api/wikidata-api'
import { wikipediaApi } from '@/api/wikipedia-api'
import { applyLanguageMapping, selectArticle, toggleLanguage } from '@/lib/comparison'
import { formatQueryUrl, parseQueryUrl } from '@/lib/query-url'

it('searches an entity, maps two languages, restores a share link and fetches both series', async () => {
  const fetchMock = vi.fn().mockImplementation(async (input: URL | string) => {
    const url = new URL(input)
    if (url.hostname === 'en.wikipedia.org') return Response.json({ query: { pages: { 1: { pageid: 1, title: 'Japan', pageprops: { wikibase_item: 'Q17' } } } } })
    if (url.hostname === 'www.wikidata.org') return Response.json({ entities: { Q17: { sitelinks: { enwiki: { title: 'Japan' }, zhwiki: { title: '\u65e5\u672c' } } } } })
    if (url.pathname.includes('/zh.wikipedia/')) return Response.json({ items: [{ project: 'zh.wikipedia', article: '\u65e5\u672c', granularity: 'daily', timestamp: '2024010100', access: 'all-access', agent: 'user', views: 0 }] })
    return Response.json({ items: [{ project: 'en.wikipedia', article: 'Japan', granularity: 'daily', timestamp: '2024010100', access: 'all-access', agent: 'user', views: 123 }] })
  })
  vi.stubGlobal('fetch', fetchMock)
  const initial: TQuery = { mode: 'languages', source: null, searchProject: 'en.wikipedia', articles: [], access: 'all-access', agent: 'user', granularity: 'daily', start: '20240101', end: '20240102' }
  const [page] = await wikipediaApi.search(initial.searchProject, 'Japan')
  const selected = selectArticle(initial, { project: initial.searchProject, article: page.title, entityId: page.pageprops?.wikibase_item })
  const mapping = await wikidataApi.getLanguageVersions(selected.source!)
  const compared = toggleLanguage(applyLanguageMapping(selected, selected.source!, mapping), mapping.versions[1], true)
  const restored = parseQueryUrl(new URL(formatQueryUrl(compared, '/Wikipedia-Chart/'), 'https://example.com'), initial)
  expect(restored).toEqual(compared)
  expect(restored.mode).toBe('languages')
  const results = await pageviewsApi.getArticles(restored)
  expect(results.map((series) => series.target.project)).toEqual(['en.wikipedia', 'zh.wikipedia'])
  expect(results.map((series) => series.items[0].views)).toEqual([123, 0])
  expect(results.map((series) => series.status)).toEqual(['success', 'success'])
  expect(fetchMock).toHaveBeenCalledTimes(5)
})
