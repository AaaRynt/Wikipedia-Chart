// src/lib/query-url.test.ts
import { describe, expect, it } from 'vitest'

import type { TQuery } from '@/data/types'

import { formatQueryUrl, parseQueryUrl } from '@/lib/query-url'

const fallback: TQuery = { searchProject: 'en.wikipedia', articles: [], access: 'all-access', agent: 'user', granularity: 'daily', start: '20240101', end: '20240229' }
const query: TQuery = {
  ...fallback,
  searchProject: 'zh.wikipedia',
  articles: [
    { project: 'en.wikipedia', article: 'Japan', entityId: 'Q17' },
    { project: 'zh.wikipedia', article: '\u65e5\u672c', entityId: 'Q17' },
    { project: 'ja.wikipedia', article: '\u65e5\u672c', entityId: 'Q17' },
    { project: 'en.wikipedia', article: 'A/B;C++_%_&_#_?' },
  ],
}

describe('query URLs', () => {
  it.each(['/', '/Wikipedia-Chart/'])('round trips projects, titles, QIDs and filters under %s', (base) => {
    const url = new URL(formatQueryUrl(query, base), 'https://example.com')
    expect(url.pathname).toBe(base)
    expect(url.searchParams.get('v')).toBe('2')
    expect(parseQueryUrl(url, fallback)).toEqual(query)
  })

  it('preserves filters and the search project even without selected articles', () => {
    const emptyQuery = { ...query, articles: [], granularity: 'monthly' as const }
    expect(parseQueryUrl(new URL(formatQueryUrl(emptyQuery, '/'), 'https://example.com'), fallback)).toEqual(emptyQuery)
  })

  it.each(['/', '/Wikipedia-Chart/'])('restores a legacy link under %s', (base) => {
    const group = ['C++', 'A/B;C', '\u65e5\u672c'].map(encodeURIComponent).join(';')
    const url = new URL(`https://example.com${base}en.wikipedia/desktop/user/${group}/daily/20240101/20240229`)
    expect(parseQueryUrl(url, fallback)).toEqual({ ...fallback, access: 'desktop', articles: ['C++', 'A/B;C', '\u65e5\u672c'].map((article) => ({ project: 'en.wikipedia', article })) })
  })

  it('deduplicates by project and normalized title, retaining languages of the same entity', () => {
    const duplicates = { ...query, articles: [...query.articles, query.articles[0]] }
    expect(parseQueryUrl(new URL(formatQueryUrl(duplicates, '/'), 'https://example.com'), fallback)).toEqual(query)
  })

  it.each([
    ['v', '3'],
    ['project', 'en.wikipedia.evil'],
    ['articles', '{broken'],
    ['articles', '{}'],
    ['articles', '[null]'],
    ['articles', '[{"project":"en.wikipedia","article":""}]'],
    ['articles', '[{"project":"en.wikipedia","article":"Japan","entityId":"oops"}]'],
    ['access', 'invalid'],
    ['agent', 'invalid'],
    ['granularity', 'hourly'],
    ['start', '20230229'],
    ['end', '20240230'],
    ['start', '20240301'],
  ])('falls back for invalid %s=%s', (key, value) => {
    const url = new URL(formatQueryUrl(query, '/'), 'https://example.com')
    url.searchParams.set(key, value)
    expect(parseQueryUrl(url, fallback)).toBe(fallback)
  })

  it.each(['/', '/en.wikipedia/desktop/user/%ZZ/daily/20240101/20240229', '/en.wikipedia/desktop/user/Japan/daily/20240101', '/en.wikipedia/desktop/user/Japan/daily/20240101/20240230'])('does not crash or use partially valid legacy state: %s', (path) => {
    expect(parseQueryUrl(new URL(path, 'https://example.com'), fallback)).toBe(fallback)
  })
})
