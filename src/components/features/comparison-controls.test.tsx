// src/components/features/comparison-controls.test.tsx

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import type { TQuery } from '@/data/types'

import { ComparisonControls } from '@/components/features'

const query: TQuery = { mode: 'articles', source: null, searchProject: 'en.wikipedia', articles: [{ project: 'en.wikipedia', article: 'Japan', entityId: 'Q17' }], access: 'all-access', agent: 'user', granularity: 'daily', start: '20240101', end: '20240102' }

describe('comparison controls markup', () => {
  it('renders one mode selector, a search language and selected article labels', () => {
    const markup = renderToStaticMarkup(<ComparisonControls query={query} setQuery={vi.fn()} />)
    expect(markup.match(/type="radio"/g)).toHaveLength(2)
    expect(markup).toMatch(/<input(?=[^>]*value="articles")(?=[^>]*checked="")[^>]*>/)
    expect(markup).toContain('aria-label="Wikipedia language"')
    expect(markup).toContain('Japan (EN)')
    expect(markup).toContain('Add article')
  })

  it('renders the chosen entity and a loading state while its language mapping is pending', () => {
    const markup = renderToStaticMarkup(<ComparisonControls query={{ ...query, mode: 'languages', source: query.articles[0] }} setQuery={vi.fn()} />)
    expect(markup).toMatch(/<input(?=[^>]*value="languages")(?=[^>]*checked="")[^>]*>/)
    expect(markup).toContain('aria-label="Search language"')
    expect(markup).toContain('Loading language versions')
    expect(markup).toContain('Select entity')
    expect(markup).toContain('https://www.wikidata.org/wiki/Q17')
  })

  it('allows an empty language comparison without making requests during render', () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const markup = renderToStaticMarkup(<ComparisonControls query={{ ...query, mode: 'languages', articles: [] }} setQuery={vi.fn()} />)
    expect(markup).toContain('Select entity')
    expect(markup).not.toContain('Loading language versions')
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
