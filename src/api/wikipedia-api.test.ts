// src/api/wikipedia-api.test.ts
import { describe, expect, it, vi } from 'vitest'

import { wikipediaApi } from '@/api/wikipedia-api'

describe('Wikipedia search', () => {
  it('uses the selected project, encodes search text and retains entity IDs in relevance order', async () => {
    const pages = [
      { pageid: 1, index: 2, title: 'Second' },
      { pageid: 2, index: 1, title: '\u65e5\u672c', pageprops: { wikibase_item: 'Q17' } },
    ]
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ query: { pages: { 1: pages[0], 2: pages[1] } } }))
    vi.stubGlobal('fetch', fetchMock)
    const signal = new AbortController().signal
    expect(await wikipediaApi.search('zh.wikipedia', ' C++ & \u65e5\u672c ', signal)).toEqual([pages[1], pages[0]])
    const [url, options] = fetchMock.mock.calls[0]
    expect(url.hostname).toBe('zh.wikipedia.org')
    expect(url.searchParams.get('gpssearch')).toBe('C++ & \u65e5\u672c')
    expect(url.searchParams.get('ppprop')).toBe('wikibase_item')
    expect(options.signal).toBe(signal)
  })

  it('does not request empty searches or invalid projects', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    expect(await wikipediaApi.search('en.wikipedia', ' ')).toEqual([])
    await expect(wikipediaApi.search('en.wikipedia/evil', 'Japan')).rejects.toThrow('Invalid Wikipedia project')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('allows empty results and articles without QIDs', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(Response.json({ batchcomplete: '' }))
        .mockResolvedValueOnce(Response.json({ query: { pages: { 1: { pageid: 1, title: 'Example' } } } })),
    )
    expect(await wikipediaApi.search('en.wikipedia', 'missing')).toEqual([])
    expect(await wikipediaApi.search('en.wikipedia', 'Example')).toEqual([{ pageid: 1, title: 'Example' }])
  })

  it('distinguishes HTTP and API errors from no results', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(Response.json({}, { status: 429 }))
        .mockResolvedValueOnce(Response.json({ error: { info: 'Rate limited' } })),
    )
    await expect(wikipediaApi.search('en.wikipedia', 'Japan')).rejects.toThrow('HTTP 429')
    await expect(wikipediaApi.search('en.wikipedia', 'Japan')).rejects.toThrow('Rate limited')
  })

  it('propagates cancellation', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new DOMException('Aborted', 'AbortError')))
    await expect(wikipediaApi.search('en.wikipedia', 'Japan')).rejects.toMatchObject({ name: 'AbortError' })
  })
})
