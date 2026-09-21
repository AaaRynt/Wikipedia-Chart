// src/lib/pageviews-snapshot.test.ts

import { describe, expect, it, vi } from 'vitest'

import type { TPageviewsSnapshot, TQuery } from '@/data/types'

import { createPageviewsExport, getPageviewsRequestKey } from '@/lib/pageviews-snapshot'

const target = { project: 'en.wikipedia', article: 'Japan', entityId: 'Q17' }
const query: TQuery = { mode: 'languages', source: target, searchProject: 'en.wikipedia', articles: [target], access: 'all-access', agent: 'user', granularity: 'daily', start: '20240101', end: '20240102' }
const snapshot: TPageviewsSnapshot = { requestKey: getPageviewsRequestKey(query), fetchedAt: '2024-01-03T00:00:00Z', series: [{ target, status: 'error', error: 'HTTP 429', items: [], statusCode: 429, url: 'https://example.com/pageviews', data: { detail: 'Rate limited' } }] }

describe('pageviews snapshot', () => {
  it('exports the displayed response including failures, without another request', () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const payload = createPageviewsExport(query, snapshot)
    expect(payload.fetchedAt).toBe(snapshot.fetchedAt)
    expect(payload.articles).toEqual(snapshot.series)
    expect(payload.articles[0].data).toBe(snapshot.series[0].data)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('does not refetch for search language or QID metadata changes', () => {
    const updated = { ...query, searchProject: 'ja.wikipedia', articles: [{ ...target, entityId: 'Q999' }] }
    expect(getPageviewsRequestKey(updated)).toBe(snapshot.requestKey)
    expect(createPageviewsExport(updated, snapshot).articles[0].target.entityId).toBe('Q999')
  })

  it('refuses stale responses after a query or series order change', () => {
    expect(() => createPageviewsExport({ ...query, start: '20240102' }, snapshot)).toThrow('still loading')
    expect(() => createPageviewsExport({ ...query, articles: [{ ...target, project: 'ja.wikipedia' }] }, snapshot)).toThrow('still loading')
    expect(getPageviewsRequestKey({ ...query, articles: [target, { ...target, project: 'ja.wikipedia' }] })).not.toBe(getPageviewsRequestKey({ ...query, articles: [{ ...target, project: 'ja.wikipedia' }, target] }))
  })
})
