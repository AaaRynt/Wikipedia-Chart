// src/lib/query-url.test.ts
import { describe, expect, it } from 'vitest'

import type { TQuery } from '@/data/types'

import { formatQueryUrl, parseQueryUrl } from '@/lib/query-url'

const fallback: TQuery = { mode: 'articles', source: null, searchProject: 'en.wikipedia', articles: [], access: 'all-access', agent: 'user', granularity: 'daily', start: '20240101', end: '20240229' }
const query: TQuery = {
  ...fallback,
  mode: 'languages',
  source: { project: 'en.wikipedia', article: 'Japan', entityId: 'Q17' },
  searchProject: 'zh.wikipedia',
  articles: [
    { project: 'en.wikipedia', article: 'Japan', entityId: 'Q17' },
    { project: 'zh.wikipedia', article: '\u65e5\u672c', entityId: 'Q17' },
    { project: 'ja.wikipedia', article: '\u65e5\u672c', entityId: 'Q17' },
  ],
}

describe('query URLs', () => {
  it.each(['/', '/Wikipedia-Chart/'])('round trips projects, titles, QIDs and filters under %s', (base) => {
    const url = new URL(formatQueryUrl(query, base), 'https://example.com')
    expect(url.pathname).toBe(base)
    expect(url.searchParams.get('v')).toBe('3')
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
    ['v', '4'],
    ['mode', 'mixed'],
    ['mode', 'articles'],
    ['source', '{}'],
    ['source', 'null'],
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

  it('round trips punctuation and non-Latin titles in article mode', () => {
    const articles = ['A/B;C++_%_&_#_?', '\u65e5\u672c'].map((article) => ({ project: 'en.wikipedia', article }))
    const articleQuery = { ...fallback, articles }
    expect(parseQueryUrl(new URL(formatQueryUrl(articleQuery, '/'), 'https://example.com'), fallback)).toEqual(articleQuery)
  })

  it('restores an entity before its QID has been looked up', () => {
    const source = { project: 'en.wikipedia', article: 'Japan' }
    const unresolved: TQuery = { ...fallback, mode: 'languages', source, articles: [source] }
    expect(parseQueryUrl(new URL(formatQueryUrl(unresolved, '/'), 'https://example.com'), fallback)).toEqual(unresolved)
  })

  it('rejects mixed entities and duplicate language projects in language mode', () => {
    for (const article of [
      { project: 'de.wikipedia', article: 'China', entityId: 'Q148' },
      { project: 'en.wikipedia', article: 'Other', entityId: 'Q17' },
    ]) {
      const invalid = { ...query, articles: [...query.articles, article] }
      expect(parseQueryUrl(new URL(formatQueryUrl(invalid, '/'), 'https://example.com'), fallback)).toBe(fallback)
    }
  })

  it('rejects mixed languages in article mode', () => {
    const invalid = { ...fallback, articles: query.articles }
    expect(parseQueryUrl(new URL(formatQueryUrl(invalid, '/'), 'https://example.com'), fallback)).toBe(fallback)
  })

  it('migrates v2 single-project and single-entity comparisons', () => {
    for (const original of [query, { ...fallback, articles: [query.articles[0]] }]) {
      const url = new URL(formatQueryUrl(original, '/'), 'https://example.com')
      url.searchParams.set('v', '2')
      url.searchParams.delete('mode')
      url.searchParams.delete('source')
      expect(parseQueryUrl(url, fallback)).toEqual(original)
    }
  })

  it('rejects v2 mixed projects without a shared entity', () => {
    const url = new URL(formatQueryUrl({ ...query, articles: [...query.articles, { project: 'de.wikipedia', article: 'China' }] }, '/'), 'https://example.com')
    url.searchParams.set('v', '2')
    expect(parseQueryUrl(url, fallback)).toBe(fallback)
  })

  it.each(['/', '/en.wikipedia/desktop/user/%ZZ/daily/20240101/20240229', '/en.wikipedia/desktop/user/Japan/daily/20240101', '/en.wikipedia/desktop/user/Japan/daily/20240101/20240230'])('does not crash or use partially valid legacy state: %s', (path) => {
    expect(parseQueryUrl(new URL(path, 'https://example.com'), fallback)).toBe(fallback)
  })
})
