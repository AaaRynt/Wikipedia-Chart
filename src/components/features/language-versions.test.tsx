// src/components/features/language-versions.test.tsx
// @vitest-environment happy-dom

import { act, useState, type Dispatch, type SetStateAction } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { TLanguageMapping, TQuery } from '@/data/types'

import { wikidataApi } from '@/api/wikidata-api'
import { LanguageVersions } from '@/components/features'
import { selectArticle } from '@/lib/comparison'

const japan = { project: 'en.wikipedia', article: 'Japan', entityId: 'Q17' }
const china = { project: 'en.wikipedia', article: 'China', entityId: 'Q148' }
const chinese = { project: 'zh.wikipedia', article: '日本', entityId: 'Q17' }
const initial: TQuery = { mode: 'languages', source: japan, searchProject: 'en.wikipedia', articles: [japan], access: 'all-access', agent: 'user', granularity: 'daily', start: '20240101', end: '20240102' }
const mapping: TLanguageMapping = { source: { ...japan }, versions: [japan, chinese] }

function deferred() {
  let resolve!: (mapping: TLanguageMapping) => void
  const promise = new Promise<TLanguageMapping>((done) => {
    resolve = done
  })
  return { promise, resolve }
}

let root: Root
let container: HTMLDivElement
let query: TQuery
let update: Dispatch<SetStateAction<TQuery>>
function Harness() {
  const [state, setState] = useState(initial)
  query = state
  update = setState
  return <LanguageVersions query={state} setQuery={setState} />
}

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
})
afterEach(async () => {
  await act(async () => root.unmount())
  container.remove()
})

function checkbox(language: string) {
  const label = Array.from(container.querySelectorAll('label')).find((element) => element.textContent?.startsWith(language))
  return label?.querySelector('input') as HTMLInputElement
}

describe('language mapping interaction', () => {
  it('loads actual titles, disables missing languages and keeps the entity when all boxes are cleared', async () => {
    const request = deferred()
    vi.spyOn(wikidataApi, 'getLanguageVersions').mockReturnValue(request.promise)
    await act(async () => root.render(<Harness />))
    expect(container.querySelector('[aria-label="Loading language versions"]')).not.toBeNull()
    await act(async () => request.resolve(mapping))
    expect(checkbox('Chinese').disabled).toBe(false)
    expect(checkbox('Japanese').disabled).toBe(true)
    expect(container.textContent).toContain('日本')
    await act(async () => checkbox('Chinese').click())
    expect(query.articles).toEqual([japan, chinese])
    await act(async () => {
      checkbox('Chinese').click()
      checkbox('English').click()
    })
    expect(query.articles).toEqual([])
    expect(query.source?.entityId).toBe('Q17')
  })

  it('retries a mapping failure and distinguishes no QID from a network error', async () => {
    const noEntity = { project: 'en.wikipedia', article: 'Japan' }
    const request = deferred()
    vi.spyOn(wikidataApi, 'getLanguageVersions').mockRejectedValueOnce(new Error('Network failed')).mockReturnValueOnce(request.promise)
    await act(async () => root.render(<Harness />))
    expect(container.querySelector('[role="alert"]')?.textContent).toContain('Network failed')
    const retry = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Retry'))!
    await act(async () => retry.click())
    expect(container.querySelector('[aria-label="Loading language versions"]')).not.toBeNull()
    await act(async () => request.resolve({ source: noEntity, versions: [noEntity], unavailable: 'no-entity' }))
    expect(container.querySelector('[role="alert"]')).toBeNull()
    expect(container.textContent).toContain('No linked Wikidata entity')
    expect(query.source?.entityId).toBeUndefined()
    expect(checkbox('Chinese').disabled).toBe(true)
    expect(checkbox('English').disabled).toBe(false)
  })

  it('does not reuse a completed mapping after clearing and reselecting the same title', async () => {
    const latest = deferred()
    const fetchMock = vi.spyOn(wikidataApi, 'getLanguageVersions').mockResolvedValueOnce(mapping).mockReturnValueOnce(latest.promise)
    await act(async () => root.render(<Harness />))
    await act(async () => container.querySelector<HTMLButtonElement>('[aria-label="Clear entity"]')!.click())
    await act(async () => update((prev) => selectArticle(prev, { ...japan, entityId: 'Q999' })))
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(container.querySelector('[aria-label="Loading language versions"]')).not.toBeNull()
    await act(async () => latest.resolve({ ...mapping, source: { ...japan } }))
    expect(query.source?.entityId).toBe('Q17')
    await act(async () => checkbox('Chinese').click())
    expect(query.articles).toContainEqual(chinese)
  })

  it('ignores old mapping results through an A to B to A transition', async () => {
    const first = deferred(),
      second = deferred(),
      third = deferred()
    const fetchMock = vi.spyOn(wikidataApi, 'getLanguageVersions').mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise).mockReturnValueOnce(third.promise)
    await act(async () => root.render(<Harness />))
    await act(async () => update((prev) => selectArticle(prev, china)))
    await act(async () => update((prev) => selectArticle(prev, japan)))
    expect(fetchMock.mock.calls[0][1]?.aborted).toBe(true)
    expect(fetchMock.mock.calls[1][1]?.aborted).toBe(true)
    await act(async () => {
      first.resolve(mapping)
      second.resolve({ source: china, versions: [china] })
    })
    expect(container.querySelector('[aria-label="Loading language versions"]')).not.toBeNull()
    await act(async () => third.resolve(mapping))
    expect(query.source?.entityId).toBe('Q17')
    expect(checkbox('Chinese').disabled).toBe(false)
  })
})
