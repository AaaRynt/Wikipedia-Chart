// src/api/pageviews-api.test.ts
import { describe, expect, it, vi } from 'vitest'

import type { TArticle, TQuery } from '@/data/types'

import { pageviewsApi } from '@/api/pageviews-api'

const target: TArticle = { project: 'ja.wikipedia', article: '\u65e5\u672c', entityId: 'Q17' }
const query: TQuery = { mode: 'languages', source: target, searchProject: 'en.wikipedia', articles: [target], access: 'all-access', agent: 'user', granularity: 'daily', start: '20240101', end: '20240102' }
const items = [{ project: target.project, article: target.article, granularity: 'daily', timestamp: '2024010100', access: 'all-access', agent: 'user', views: 0 }]

describe('pageviews API', () => {
  it('uses each article project instead of the search project and encodes the title as one segment', () => {
    const url = pageviewsApi.buildUrl(query, { ...target, article: 'A/B;C++_%_\u65e5\u672c' })
    expect(url).toContain('/ja.wikipedia/all-access/user/A%2FB%3BC%2B%2B_%25_%E6%97%A5%E6%9C%AC/daily/')
    expect(url).not.toContain('en.wikipedia')
  })

  it('keeps successful series when other requests fail or have no data', async () => {
    const articles = [target, { ...target, project: 'zh.wikipedia' }, { ...target, project: 'en.wikipedia' }, { ...target, project: 'fr.wikipedia' }]
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ items }))
      .mockRejectedValueOnce(new TypeError('Network error'))
      .mockResolvedValueOnce(Response.json({ detail: 'Not found' }, { status: 404 }))
      .mockResolvedValueOnce(Response.json({}, { status: 429 }))
    vi.stubGlobal('fetch', fetchMock)
    const signal = new AbortController().signal
    const results = await pageviewsApi.getArticles({ ...query, articles }, signal)
    expect(results.map((result) => result.status)).toEqual(['success', 'error', 'empty', 'error'])
    expect(results[0].items).toEqual(items)
    expect(results[0].items[0].views).toBe(0)
    expect(results[1].error).toBe('Network error')
    expect(results[2].statusCode).toBe(404)
    expect(results[3].error).toContain('429')
    expect(results.map((result) => result.target)).toEqual(articles)
    expect(fetchMock.mock.calls.every(([, options]) => options.signal === signal)).toBe(true)
  })

  it('keeps an empty result distinct from malformed data', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(Response.json({ items: [] }))
        .mockResolvedValueOnce(Response.json({ items: [{ timestamp: 'bad', views: '5' }] }))
        .mockResolvedValueOnce(Response.json({ unexpected: [] })),
    )
    expect((await pageviewsApi.getArticle(query, target)).status).toBe('empty')
    expect((await pageviewsApi.getArticle(query, target)).status).toBe('error')
    expect((await pageviewsApi.getArticle(query, target)).status).toBe('error')
  })

  it('reports invalid JSON as an error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>Unavailable</html>', { status: 503 })))
    expect(await pageviewsApi.getArticle(query, target)).toMatchObject({ status: 'error', statusCode: 503, items: [] })
  })

  it('propagates cancellation instead of showing it as a failed series', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new DOMException('Aborted', 'AbortError')))
    await expect(pageviewsApi.getArticles(query)).rejects.toMatchObject({ name: 'AbortError' })
  })
})
