// src/hooks/use-pageviews.test.tsx
// @vitest-environment happy-dom

import { act, StrictMode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { TPageviewsResult, TQuery } from '@/data/types'

import { pageviewsApi } from '@/api/pageviews-api'
import { usePageviews } from '@/hooks/use-pageviews'

const target = { project: 'en.wikipedia', article: 'Japan', entityId: 'Q17' }
const query: TQuery = { mode: 'languages', source: target, searchProject: 'en.wikipedia', articles: [target], access: 'all-access', agent: 'user', granularity: 'daily', start: '20240101', end: '20240102' }
const results: TPageviewsResult[] = [{ target, status: 'empty', items: [], statusCode: 404, url: pageviewsApi.buildUrl(query, target), data: {} }]

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => {
    resolve = done
  })
  return { promise, resolve }
}

let root: Root
let container: HTMLDivElement
let state: ReturnType<typeof usePageviews>
function Harness({ query }: { query: TQuery }) {
  state = usePageviews(query)
  return <button onClick={state.retry}>Retry</button>
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

describe('pageviews request lifecycle', () => {
  it('shares completed results and does not refetch when only search language or QID changes', async () => {
    const request = deferred<TPageviewsResult[]>()
    const fetchMock = vi.spyOn(pageviewsApi, 'getArticles').mockReturnValue(request.promise)
    await act(async () => root.render(<Harness query={query} />))
    expect(state.loading).toBe(true)
    expect(state.snapshot).toBeNull()
    await act(async () => request.resolve(results))
    expect(state.loading).toBe(false)
    expect(state.snapshot?.series).toBe(results)
    const snapshot = state.snapshot
    await act(async () => root.render(<Harness query={{ ...query, searchProject: 'zh.wikipedia', articles: [{ ...target, entityId: 'Q999' }] }} />))
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(state.snapshot).toBe(snapshot)
  })

  it('cancels the previous query and ignores its result even if fetch ignores cancellation', async () => {
    const old = deferred<TPageviewsResult[]>()
    const current = deferred<TPageviewsResult[]>()
    const fetchMock = vi.spyOn(pageviewsApi, 'getArticles').mockReturnValueOnce(old.promise).mockReturnValueOnce(current.promise)
    await act(async () => root.render(<Harness query={query} />))
    const signal = fetchMock.mock.calls[0][1]
    await act(async () => root.render(<Harness query={{ ...query, start: '20240102' }} />))
    expect(signal?.aborted).toBe(true)
    await act(async () => old.resolve(results))
    expect(state.snapshot).toBeNull()
    expect(state.loading).toBe(true)
    const updated = [{ ...results[0], status: 'error' as const, error: 'Rate limited' }]
    await act(async () => current.resolve(updated))
    expect(state.snapshot?.series).toBe(updated)
  })

  it('invalidates the export snapshot while retrying and recovers from failure', async () => {
    const retry = deferred<TPageviewsResult[]>()
    vi.spyOn(pageviewsApi, 'getArticles').mockRejectedValueOnce(new Error('Network failed')).mockReturnValueOnce(retry.promise)
    await act(async () => root.render(<Harness query={query} />))
    expect(state.snapshot?.series[0]).toMatchObject({ status: 'error', error: 'Network failed' })
    await act(async () => container.querySelector('button')!.click())
    expect(state.snapshot).toBeNull()
    expect(state.loading).toBe(true)
    await act(async () => retry.resolve(results))
    expect(state.loading).toBe(false)
    expect(state.snapshot?.series).toBe(results)
  })

  it('handles Strict Mode cleanup and clearing articles without exposing old data', async () => {
    const fetchMock = vi.spyOn(pageviewsApi, 'getArticles').mockResolvedValue(results)
    await act(async () =>
      root.render(
        <StrictMode>
          <Harness query={query} />
        </StrictMode>,
      ),
    )
    expect(fetchMock.mock.calls[0][1]?.aborted).toBe(true)
    expect(state.snapshot?.series).toEqual(results)
    await act(async () =>
      root.render(
        <StrictMode>
          <Harness query={{ ...query, articles: [] }} />
        </StrictMode>,
      ),
    )
    expect(state.snapshot).toBeNull()
    expect(state.loading).toBe(false)
    expect(fetchMock.mock.calls.at(-1)?.[1]?.aborted).toBe(true)
  })
})
