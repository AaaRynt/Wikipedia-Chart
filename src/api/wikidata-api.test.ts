// src/api/wikidata-api.test.ts

import { describe, expect, it, vi } from 'vitest'

import { wikidataApi } from '@/api/wikidata-api'

const source = { project: 'en.wikipedia', article: 'Japan' }
const page = (title = 'Japan', entityId: string | undefined = 'Q17') => Response.json({ query: { pages: { 1: { pageid: 1, title, pageprops: entityId ? { wikibase_item: entityId } : {} } } } })
const entity = () => Response.json({ entities: { Q17: { id: 'Q17', sitelinks: { enwiki: { title: 'Japan' }, jawiki: { title: '\u65e5\u672c' }, zhwiki: { title: '\u65e5\u672c' }, enwikivoyage: { title: 'Japan' }, commonswiki: { title: 'Japan' } } } } })

describe('Wikidata language mapping', () => {
  it('resolves a page identity then uses actual Wikipedia sitelinks, not title translation', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(page()).mockResolvedValueOnce(entity())
    vi.stubGlobal('fetch', fetchMock)
    const signal = new AbortController().signal
    const result = await wikidataApi.getLanguageVersions(source, signal)
    expect(result.source.entityId).toBe('Q17')
    expect(result.versions).toEqual([
      { ...source, entityId: 'Q17' },
      { project: 'zh.wikipedia', article: '\u65e5\u672c', entityId: 'Q17' },
      { project: 'ja.wikipedia', article: '\u65e5\u672c', entityId: 'Q17' },
    ])
    expect(fetchMock.mock.calls[0][0].hostname).toBe('en.wikipedia.org')
    expect(fetchMock.mock.calls[0][0].searchParams.get('redirects')).toBe('1')
    expect(fetchMock.mock.calls[1][0].hostname).toBe('www.wikidata.org')
    expect(fetchMock.mock.calls[1][0].searchParams.get('ids')).toBe('Q17')
    expect(fetchMock.mock.calls.every(([, options]) => options.signal === signal)).toBe(true)
  })

  it('resolves redirects and replaces an outdated or incorrect shared QID', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(page()).mockResolvedValueOnce(entity()))
    expect((await wikidataApi.getLanguageVersions({ ...source, article: 'Old_Japan', entityId: 'Q148' })).source).toEqual({ ...source, entityId: 'Q17' })
  })

  it('keeps a page without a QID available without requesting Wikidata', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ query: { pages: { 1: { pageid: 1, title: 'No entity' } } } }))
    vi.stubGlobal('fetch', fetchMock)
    expect(await wikidataApi.getLanguageVersions(source)).toEqual({ source: { ...source, article: 'No_entity' }, versions: [{ ...source, article: 'No_entity' }], unavailable: 'no-entity' })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('distinguishes missing pages and deleted entities from network errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(Response.json({ query: { pages: { '-1': { title: 'Japan', missing: '' } } } }))
        .mockResolvedValueOnce(page())
        .mockResolvedValueOnce(Response.json({ entities: { Q17: { missing: '' } } })),
    )
    expect((await wikidataApi.getLanguageVersions(source)).unavailable).toBe('missing-page')
    expect((await wikidataApi.getLanguageVersions(source)).unavailable).toBe('missing-entity')
  })

  it('retains the source when no other supported language exists', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(page())
        .mockResolvedValueOnce(Response.json({ entities: { Q17: { sitelinks: {} } } })),
    )
    expect((await wikidataApi.getLanguageVersions(source)).versions).toEqual([{ ...source, entityId: 'Q17' }])
  })

  it('does not guess unsupported site IDs from language codes', async () => {
    const target = { project: 'be-tarask.wikipedia', article: 'Example' }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(page('Example')).mockResolvedValueOnce(entity()))
    const result = await wikidataApi.getLanguageVersions(target)
    expect(result.source.project).toBe('be-tarask.wikipedia')
    expect(result.versions[0]).toEqual({ ...target, entityId: 'Q17' })
  })

  it.each([() => Response.json({}, { status: 429 }), () => Response.json({ error: { info: 'Rate limited' } }), () => Response.json({ entities: {} }), () => Response.json({ entities: { Q17: {} } }), () => new Response('not json')])('reports failed or malformed Wikidata responses', async (response) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(page()).mockResolvedValueOnce(response()))
    await expect(wikidataApi.getLanguageVersions(source)).rejects.toThrow()
  })

  it('stops before the second request when the source lookup is cancelled', async () => {
    const controller = new AbortController()
    const fetchMock = vi.fn().mockImplementation(async () => {
      controller.abort()
      return page()
    })
    vi.stubGlobal('fetch', fetchMock)
    await expect(wikidataApi.getLanguageVersions(source, controller.signal)).rejects.toMatchObject({ name: 'AbortError' })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('does not return stale sitelinks after cancellation', async () => {
    const controller = new AbortController()
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(page())
        .mockImplementationOnce(async () => {
          controller.abort()
          return entity()
        }),
    )
    await expect(wikidataApi.getLanguageVersions(source, controller.signal)).rejects.toMatchObject({ name: 'AbortError' })
  })
})
